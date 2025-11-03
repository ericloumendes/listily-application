import * as FileSystem from "expo-file-system";
import { jwtDecode } from "jwt-decode";
import { Lista } from "../interfaces/lista_interface";

function decodeJwt(token: string): { pk: number; email: string; nome: string } {
  return jwtDecode(token);
}

function userDir(token: string) {
  const { pk } = decodeJwt(token);
  const baseDir = ((FileSystem as any).documentDirectory ?? (FileSystem as any).cacheDirectory ?? "") as string;
  if (!baseDir) throw new Error("No writable directory available for file storage");
  return `${baseDir}listily/user_${pk}/`;
}

async function ensureDir(dir: string) {
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

export async function saveUserListasToFile(token: string, listas: Lista[]) {
  const dir = userDir(token);
  await ensureDir(dir);
  const file = `${dir}listas.json`;
  await FileSystem.writeAsStringAsync(file, JSON.stringify(listas));
}

export async function readUserListasFromFile(token: string): Promise<Lista[] | null> {
  const dir = userDir(token);
  const file = `${dir}listas.json`;
  const info = await FileSystem.getInfoAsync(file);
  if (!info.exists) return null;
  try {
    const content = await FileSystem.readAsStringAsync(file);
    return JSON.parse(content) as Lista[];
  } catch {
    return null;
  }
}

export async function saveListaToFile(token: string, lista: Lista) {
  const dir = userDir(token);
  await ensureDir(dir);
  const file = `${dir}lista_${lista.pk}.json`;
  await FileSystem.writeAsStringAsync(file, JSON.stringify(lista));
}

export async function readListaFromFile(token: string, id: number): Promise<Lista | null> {
  const dir = userDir(token);
  const file = `${dir}lista_${id}.json`;
  const info = await FileSystem.getInfoAsync(file);
  if (!info.exists) return null;
  try {
    const content = await FileSystem.readAsStringAsync(file);
    return JSON.parse(content) as Lista;
  } catch {
    return null;
  }
}
