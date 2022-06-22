import * as Server from "@ucanto/server"
import { provide } from "@ucanto/server"
import * as API from "../type.js"
import * as Identity from "../identity/invoke.js"
import * as Capability from "./capability.js"

/**
 * @param {API.Store.ServiceOptions} options
 * @returns {API.Store.Store}
 */
export const service = ({
  self,
  identity,
  accounting,
  signer,
  signerConfig,
}) => {
  return {
    add: provide(Capability.add, async ({ capability, invocation }) => {
      const link = /** @type {API.Store.CARLink|undefined} */ (
        capability.caveats.link
      )
      if (!link) {
        return new Server.MalformedCapability(
          invocation.capabilities[0],
          new Server.Failure(`No link was provided in the capability`)
        )
      }

      const id = /** @type {API.DID} */ (capability.with)
      // First we need to check if we have an account associted with a DID
      // car is been added to.
      const account = await Identity.identify({
        issuer: self,
        audience: identity.id,
        id,
        // We use `store/add` invocation as a proof that we can identify an
        // account for the did.
        proof: invocation,
      }).execute(identity.client)

      // If we failed to resolve an account we deny access by returning n error.
      if (account.error) {
        return account
      }

      const result = await accounting.add(id, link, invocation.cid)
      if (result.error) {
        return result
      }

      if (result.status === "not-in-s3") {
        const url = await signer.sign(link, signerConfig)
        return {
          status: "upload",
          with: id,
          link,
          url: url.href,
        }
      } else {
        return {
          status: "done",
          with: id,
          link,
        }
      }
    }),
    remove: provide(Capability.remove, async ({ capability, invocation }) => {
      const { link } = capability.caveats
      if (!link) {
        return new Server.MalformedCapability(
          invocation.capabilities[0],
          new Server.Failure(`No link was provided in the capability`)
        )
      }

      const id = /** @type {API.DID} */ (capability.with)
      await accounting.remove(id, link, invocation.cid)
      return link
    }),
    list: provide(Capability.list, async ({ capability, invocation }) => {
      const id = /** @type {API.DID} */ (capability.with)
      return await accounting.list(id, invocation.cid)
    }),
  }
}

/**
 *
 * @param {API.Store.Options} options
 */
export const server = ({ transport, context, validation }) =>
  Server.create({
    ...transport,
    ...validation,
    id: context.self.authority,
    service: {
      store: service(context),
    },
  })
