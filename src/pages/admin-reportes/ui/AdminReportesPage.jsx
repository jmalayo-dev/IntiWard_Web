import { useMemo } from 'react';
import { TIPO_COMPROBANTE, useReporte } from '@/entities/comprobante';
import { useProductos, TAMANO_TODOS } from '@/entities/producto';
import { useVentas } from '@/entities/venta';
import { useFiltroReporte } from '@/features/filtrar-reporte';
import { descargarCsv, formatoFecha, formatoMoneda, useTitulo } from '@/shared/lib';
import { BarraProgreso, Boton, Cargando, EncabezadoPagina, EstadoVacio, GraficoDona, GraficoLineas, Icono, Indicador, MensajeError, RangoFechas, Tarjeta } from '@/shared/ui';
import { masVendidos, porCategoria, porDia, rangoAnterior } from '../model/series';
import styles from './AdminReportesPage.module.css';

const soles = (n) => `S/ ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

/** Vista 5.9 · Reporte de ventas. Totales de GET /comprobantes/reporte; ranking y categorías desde las ventas. */
export function AdminReportesPage() {
  useTitulo('Reporte de ventas');
  const { rango, cambiarRango } = useFiltroReporte();
  const anterior = rangoAnterior(rango);
  const { data: reporte, isLoading, error, refetch } = useReporte(rango);
  const { data: reporteAnterior } = useReporte(anterior);
  const { data: ventas = [] } = useVentas();
  const { data: productos } = useProductos({ size: TAMANO_TODOS, inactivos: true });

  const enRango = useMemo(
    () => ventas.filter((v) => v.fechaVenta.slice(0, 10) >= rango.desde && v.fechaVenta.slice(0, 10) <= rango.hasta),
    [ventas, rango],
  );
  const confirmadas = enRango.filter((v) => v.estado === 'CONFIRMADA');
  const anuladas = enRango.filter((v) => v.estado === 'ANULADA').length;
  const categoriaDe = Object.fromEntries((productos?.items ?? []).map((p) => [p.id, p.categoria]));

  const diario = reporte ? porDia(reporte.comprobantes, rango.desde, rango.hasta) : [];
  const diarioAnterior = reporteAnterior ? porDia(reporteAnterior.comprobantes, anterior.desde, anterior.hasta) : [];
  const ranking = masVendidos(confirmadas);
  const categorias = porCategoria(confirmadas, categoriaDe);
  const boletas = reporte?.comprobantes.filter((c) => c.tipo === 'BOLETA').length ?? 0;
  const facturas = (reporte?.cantidad ?? 0) - boletas;

  const descargar = () =>
    descargarCsv(`reporte-${rango.desde}-${rango.hasta}.csv`, [
      { titulo: 'Número', valor: (c) => c.numero },
      { titulo: 'Tipo', valor: (c) => TIPO_COMPROBANTE[c.tipo]?.texto ?? c.tipo },
      { titulo: 'Fecha', valor: (c) => formatoFecha(c.emitidoEn) },
      { titulo: 'Cliente', valor: (c) => c.nombreRazonSocial },
      { titulo: 'Subtotal', valor: (c) => c.subtotal.toFixed(2) },
      { titulo: 'IGV', valor: (c) => c.igv.toFixed(2) },
      { titulo: 'Total', valor: (c) => c.total.toFixed(2) },
    ], [...reporte.comprobantes, { numero: 'TOTAL', tipo: '', emitidoEn: '', nombreRazonSocial: `${reporte.cantidad} comprobantes`, subtotal: reporte.subtotal, igv: reporte.igv, total: reporte.total }]);

  return (
    <div className={styles.reporte}>
      <EncabezadoPagina
        titulo="Reporte de ventas"
        acciones={
          <>
            <RangoFechas desde={rango.desde} hasta={rango.hasta} alCambiar={(r) => r.desde && r.hasta && cambiarRango(r)} />
            <Boton onClick={descargar} disabled={!reporte?.cantidad}>
              <Icono nombre="descargar" tamano={18} /> Descargar reporte
            </Boton>
          </>
        }
      />

      {error ? (
        <MensajeError error={error} alReintentar={refetch} />
      ) : isLoading ? (
        <Cargando lineas={4} alto={120} />
      ) : (
        <>
          <div className={styles.indicadores}>
            <Indicador titulo="Total vendido" valor={formatoMoneda(reporte.total)} />
            <Indicador titulo="Ventas" valor={reporte.cantidad} />
            <Indicador titulo="Ticket promedio" valor={formatoMoneda(reporte.cantidad ? reporte.total / reporte.cantidad : 0)} />
            <Indicador
              titulo="Ventas anuladas"
              valor={
                <>
                  {anuladas} <span className={styles.porcentaje}>{enRango.length ? `${((anuladas / enRango.length) * 100).toFixed(1)} %` : '0 %'}</span>
                </>
              }
            />
          </div>

          <Tarjeta titulo="Ventas por día">
            {reporte.cantidad || reporteAnterior?.cantidad ? (
              <GraficoLineas
                etiqueta="Ventas por día"
                etiquetas={diario.map((d) => d.etiqueta)}
                formato={soles}
                series={[
                  { nombre: 'Este período', valores: diario.map((d) => d.valor) },
                  { nombre: 'Período anterior', valores: diario.map((_, i) => diarioAnterior[i]?.valor ?? 0), punteada: true },
                ]}
              />
            ) : (
              <EstadoVacio icono="grafico" titulo="No hay ventas en este período" texto="Elige otro rango de fechas." />
            )}
          </Tarjeta>

          <div className={styles.fila}>
            <Tarjeta titulo="Productos más vendidos">
              {ranking.length ? (
                <div className={styles.ranking}>
                  {ranking.map((p) => (
                    <BarraProgreso key={p.nombre} etiqueta={p.nombre} valor={p.unidades} maximo={ranking[0].unidades} texto={`${p.unidades} u.`} />
                  ))}
                </div>
              ) : (
                <p className={styles.gris}>Sin ventas confirmadas en el período.</p>
              )}
            </Tarjeta>
            <Tarjeta titulo="Ventas por categoría">
              {categorias.length ? <GraficoDona datos={categorias} etiqueta="Ventas por categoría" /> : <p className={styles.gris}>Sin ventas confirmadas en el período.</p>}
            </Tarjeta>
          </div>

          <Tarjeta titulo="Boletas y facturas">
            <div className={styles.ranking}>
              <BarraProgreso etiqueta="Boletas" valor={boletas} maximo={Math.max(boletas, facturas, 1)} />
              <BarraProgreso etiqueta="Facturas" valor={facturas} maximo={Math.max(boletas, facturas, 1)} tono="gris" />
            </div>
          </Tarjeta>
        </>
      )}
    </div>
  );
}
