import { Document, Page, View, Text, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#0a0e17', color: '#f1f5f9', fontFamily: 'Helvetica' },
  header: { marginBottom: 24, borderBottom: '2 solid #3b82f6', paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f1f5f9' },
  subtitle: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6', letterSpacing: 1, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: '#1e293b' },
  label: { fontSize: 11, color: '#94a3b8' },
  value: { fontSize: 11, color: '#f1f5f9', fontWeight: 'bold' },
  gwiScore: { fontSize: 48, fontWeight: 'bold', color: '#f59e0b', textAlign: 'center', marginVertical: 16 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#475569', textAlign: 'center', borderTopWidth: 0.5, borderTopColor: '#1e293b', paddingTop: 12 },
});

export async function generatePdfBuffer(infografia: any): Promise<Buffer> {
  const data = infografia.data_snapshot as any;

  const PdfDoc = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Informe Semanal de Riesgos #{infografia.edition}</Text>
          <Text style={styles.subtitle}>{infografia.week_start} — {infografia.week_end}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GLOBAL WEEKLY INDEX (GWI)</Text>
          <Text style={styles.gwiScore}>{data?.gwi?.total?.toFixed(1) || '—'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DISTRIBUCIÓN DE RIESGO</Text>
          {data?.riskDistribution && Object.entries(data.riskDistribution).map(([k, v]) => (
            <View key={k} style={styles.row}>
              <Text style={styles.label}>{String(k)}</Text>
              <Text style={styles.value}>{String(v)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TOP 10 — MAYOR RIESGO</Text>
          {data?.topRiskCountries?.slice(0, 10).map((c: any, i: number) => (
            <View key={i} style={styles.row}>
              <Text style={styles.label}>{i + 1}. {c.flag} {c.name}</Text>
              <Text style={styles.value}>{c.riskLevel?.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TOP 10 — MENOR RIESGO</Text>
          {data?.topSafeCountries?.slice(0, 10).map((c: any, i: number) => (
            <View key={i} style={styles.row}>
              <Text style={styles.label}>{i + 1}. {c.flag} {c.name}</Text>
              <Text style={styles.value}>{c.riskLevel?.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>VIAJE CON INTELIGENCIA — viajeinteligencia.com/infografias</Text>
          <Text>OSINT • ML • TRAVEL RISK INTELLIGENCE — Edición #{infografia.edition}</Text>
        </View>
      </Page>
    </Document>
  );

  const pdfStream = await pdf(<PdfDoc />).toBlob();
  return Buffer.from(await pdfStream.arrayBuffer());
}
