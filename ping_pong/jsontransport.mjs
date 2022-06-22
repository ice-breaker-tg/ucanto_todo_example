const HEADERS = {
  'content-type': 'application/json',
};

export default {
  encode: (data) => {
    //     console.log('encode called');
    const encoded = JSON.stringify(data);
    return {
      headers: HEADERS,
      body: encoded,
    };
  },
  decode: ({ headers, body }) => {
    //     console.log('decode called headers', headers);
    //     console.log('decode called body', body);

    if (typeof body != 'string') {
      var decoder = new TextDecoder();
      return decoder.decode(body);
    }

    const parsed = JSON.parse(body);

    return [
      {
        ...parsed[0],
        issuer: {
          did: () => parsed[0].issuer._did,
          expiration: null,
        },
        audience: {
          did: () => parsed[0].audience._did,
          expiration: null,
          //           did: () => 'NO_DID',
        },
      },
    ];
  },
};
