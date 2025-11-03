import { Lista } from "../interfaces/lista_interface";
import { Produto } from "../interfaces/produto_interface";
import * as Print from "expo-print";

function buildHtml(lista: Lista) {
  const grouped: Record<string, Produto[]> = (lista.produtos || []).reduce(
    (acc, p) => {
      const key = p.supermercado?.nome || "Sem supermercado";
      if (!acc[key]) acc[key] = [] as Produto[];
      acc[key].push(p);
      return acc;
    },
    {} as Record<string, Produto[]>
  );

  const sections = Object.keys(grouped)
    .sort((a, b) => a.localeCompare(b))
    .map((superNome) => {
      const items = grouped[superNome]
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .map((p) => {
          const latest = (p.precos || []).reduce((latest, current) => {
            if (!latest || new Date(current.data_registro) > new Date(latest.data_registro)) return current;
            return latest;
          }, null as any);
          const precoStr = latest ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(latest.preco) : "-";
          return `<li><span class="prod">${p.nome}</span><span class="preco">${precoStr}</span></li>`;
        })
        .join("");
      return `
        <section>
          <h2>${superNome}</h2>
          <ul>${items}</ul>
        </section>
      `;
    })
    .join("");

  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 24px; }
        h1 { margin: 0 0 16px; font-size: 22px; }
        h2 { margin: 24px 0 8px; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
        ul { list-style: none; padding: 0; margin: 0; }
        li { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e5e5e5; font-size: 14px; }
        .prod { max-width: 70%; }
        .preco { color: #16a34a; font-weight: 600; }
        footer { margin-top: 24px; font-size: 11px; color: #888; }
      </style>
    </head>
    <body>
      <h1>Lista: ${lista.nome}</h1>
      ${sections || '<p>Nenhum produto.</p>'}
      <footer>Gerado por Listily</footer>
    </body>
  </html>`;

  return html;
}

export async function generateListaPdf(lista: Lista): Promise<{ uri: string }> {
  const html = buildHtml(lista);
  const { uri } = await Print.printToFileAsync({ html });
  return { uri };
}
