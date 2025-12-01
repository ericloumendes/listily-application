import * as SecureStore from 'expo-secure-store';

const keyForProduto = (pk: number) => `ofertas:lastSeenCount:${pk}`;

export async function getLastSeenCount(produtoPk: number): Promise<number> {
  const v = await SecureStore.getItemAsync(keyForProduto(produtoPk));
  return v ? Number(v) : 0;
}

export async function setLastSeenCount(produtoPk: number, count: number) {
  await SecureStore.setItemAsync(keyForProduto(produtoPk), String(count));
}
