import { urlApiPermitida } from './rede';

describe('url da API', () => {
  it('aceita HTTPS em qualquer ambiente', () => {
    expect(urlApiPermitida('https://api.exemplo.com', false)).toBe(true);
  });

  it('aceita o laboratório local só em desenvolvimento', () => {
    expect(urlApiPermitida('http://127.0.0.1:3000', true)).toBe(true);
    expect(urlApiPermitida('http://192.168.0.12:3000', true)).toBe(true);
    expect(urlApiPermitida('http://10.0.2.2:3000', true)).toBe(true);
    expect(urlApiPermitida('http://127.0.0.1:3000', false)).toBe(false);
    expect(urlApiPermitida('http://api.exemplo.com', false)).toBe(false);
  });
});
