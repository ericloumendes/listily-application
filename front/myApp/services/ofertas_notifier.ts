import { getOfertasByProdutoPk } from './ofertas_service';
import { ensureLocalNotificationsReady, notifyNewOferta } from '../utils/notifications';
import { getLastSeenCount, setLastSeenCount } from '../utils/ofertasSeenStore';

export type ProdutoInfo = { pk: number; nome?: string };

export async function checkAndNotifyForNewOfertas(
  produtos: ProdutoInfo[],
  token: string
) {
  if (!produtos?.length || !token) return;

  const ok = await ensureLocalNotificationsReady();
  if (!ok) return;

  for (const p of produtos) {
    try {
      const ofertas = await getOfertasByProdutoPk(p.pk, token);
      const currentCount = Array.isArray(ofertas) ? ofertas.length : 0;
      const lastCount = await getLastSeenCount(p.pk);

      if (currentCount > lastCount) {
        const delta = currentCount - lastCount;
        await notifyNewOferta(
          'Nova oferta',
          `${p.nome ?? 'Um produto'} tem ${delta} nova(s) oferta(s).`,
          { produtoPk: p.pk, novas: delta }
        );
      }

      await setLastSeenCount(p.pk, currentCount);
    } catch {
      // ignore errors per produto
    }
  }
}
