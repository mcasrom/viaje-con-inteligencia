import type { NivelRiesgo } from "../paises";

interface DatoFuente {
  nivelRiesgo: NivelRiesgo;
  nivelOriginal: string;
  url: string;
  resumen: string | null;
  actualizado: string | null;
}

export type PaisFuentesHardcoded = {
  "uk-fcdo"?: DatoFuente;
  "canada"?: DatoFuente;
  "australia"?: DatoFuente;
};

function uk(n: NivelRiesgo, label: string, slug: string): DatoFuente {
  return { nivelRiesgo: n, nivelOriginal: label, url: "https://www.gov.uk/foreign-travel-advice/" + slug, resumen: null, actualizado: "2026-05" };
}
function ca(n: NivelRiesgo, label: string, slug: string): DatoFuente {
  return { nivelRiesgo: n, nivelOriginal: label, url: "https://travel.gc.ca/destinations/" + slug, resumen: null, actualizado: "2026-05" };
}
function au(n: NivelRiesgo, label: string, slug: string): DatoFuente {
  return { nivelRiesgo: n, nivelOriginal: label, url: "https://www.smartraveller.gov.au/destinations/" + slug, resumen: null, actualizado: "2026-05" };
}

export const DATOS_HARDCODEADOS: Record<string, PaisFuentesHardcoded> = {
  ma:  { "uk-fcdo": uk("medio", "Exercise increased caution", "morocco"), "canada": ca("bajo", "Exercise normal precautions", "morocco"), "australia": au("bajo", "Exercise normal safety precautions", "morocco") },
  dz:  { "uk-fcdo": uk("alto", "Advise against all but essential travel", "algeria"), "canada": ca("alto", "Avoid non-essential travel", "algeria"), "australia": au("alto", "Reconsider your need to travel", "algeria") },
  eg:  { "uk-fcdo": uk("medio", "Exercise increased caution", "egypt"), "canada": ca("medio", "Exercise a high degree of caution", "egypt"), "australia": au("medio", "Exercise a high degree of caution", "egypt") },
  il:  { "uk-fcdo": uk("alto", "Advise against all but essential travel", "israel"), "canada": ca("alto", "Avoid non-essential travel", "israel"), "australia": au("alto", "Reconsider your need to travel", "israel") },
  ir:  { "uk-fcdo": uk("muy-alto", "Advise against all travel", "iran"), "canada": ca("muy-alto", "Avoid all travel", "iran"), "australia": au("muy-alto", "Do not travel", "iran") },
  ru:  { "uk-fcdo": uk("muy-alto", "Advise against all travel", "russia"), "canada": ca("muy-alto", "Avoid all travel", "russia"), "australia": au("muy-alto", "Do not travel", "russia") },
  ua:  { "uk-fcdo": uk("muy-alto", "Advise against all travel", "ukraine"), "canada": ca("muy-alto", "Avoid all travel", "ukraine"), "australia": au("muy-alto", "Do not travel", "ukraine") },
  ve:  { "uk-fcdo": uk("muy-alto", "Advise against all travel", "venezuela"), "canada": ca("muy-alto", "Avoid all travel", "venezuela"), "australia": au("muy-alto", "Do not travel", "venezuela") },
  cu:  { "uk-fcdo": uk("bajo", "Exercise normal precautions", "cuba"), "canada": ca("medio", "Exercise a high degree of caution", "cuba"), "australia": au("bajo", "Exercise normal safety precautions", "cuba") },
  cn:  { "uk-fcdo": uk("bajo", "Exercise normal precautions", "china"), "canada": ca("bajo", "Exercise normal precautions", "china"), "australia": au("medio", "Exercise a high degree of caution", "china") },
  tr:  { "uk-fcdo": uk("bajo", "Exercise normal precautions", "turkey"), "canada": ca("bajo", "Exercise normal precautions", "turkey"), "australia": au("bajo", "Exercise normal safety precautions", "turkey") },
  sy:  { "uk-fcdo": uk("muy-alto", "Advise against all travel", "syria"), "canada": ca("muy-alto", "Avoid all travel", "syria"), "australia": au("muy-alto", "Do not travel", "syria") },
  ly:  { "uk-fcdo": uk("muy-alto", "Advise against all travel", "libya"), "canada": ca("muy-alto", "Avoid all travel", "libya"), "australia": au("muy-alto", "Do not travel", "libya") },
  lb:  { "uk-fcdo": uk("alto", "Advise against all but essential travel", "lebanon"), "canada": ca("alto", "Avoid non-essential travel", "lebanon"), "australia": au("alto", "Reconsider your need to travel", "lebanon") },
  ml:  { "uk-fcdo": uk("muy-alto", "Advise against all travel", "mali"), "canada": ca("muy-alto", "Avoid all travel", "mali"), "australia": au("muy-alto", "Do not travel", "mali") },
  af:  { "uk-fcdo": uk("muy-alto", "Advise against all travel", "afghanistan"), "canada": ca("muy-alto", "Avoid all travel", "afghanistan"), "australia": au("muy-alto", "Do not travel", "afghanistan") },
  ye:  { "uk-fcdo": uk("muy-alto", "Advise against all travel", "yemen"), "canada": ca("muy-alto", "Avoid all travel", "yemen"), "australia": au("muy-alto", "Do not travel", "yemen") },
  mx:  { "uk-fcdo": uk("bajo", "Exercise normal precautions", "mexico"), "canada": ca("bajo", "Exercise normal precautions", "mexico"), "australia": au("bajo", "Exercise normal safety precautions", "mexico") },
  co:  { "uk-fcdo": uk("bajo", "Exercise normal precautions", "colombia"), "canada": ca("bajo", "Exercise normal precautions", "colombia"), "australia": au("bajo", "Exercise normal safety precautions", "colombia") },
  za:  { "uk-fcdo": uk("medio", "Exercise increased caution", "south-africa"), "canada": ca("medio", "Exercise a high degree of caution", "south-africa"), "australia": au("bajo", "Exercise normal safety precautions", "south-africa") },
  ph:  { "uk-fcdo": uk("bajo", "Exercise normal precautions", "philippines"), "canada": ca("bajo", "Exercise normal precautions", "philippines"), "australia": au("bajo", "Exercise normal safety precautions", "philippines") },
  th:  { "uk-fcdo": uk("bajo", "Exercise normal precautions", "thailand"), "canada": ca("bajo", "Exercise normal precautions", "thailand"), "australia": au("bajo", "Exercise normal safety precautions", "thailand") },
  in:  { "uk-fcdo": uk("bajo", "Exercise normal precautions", "india"), "canada": ca("bajo", "Exercise normal precautions", "india"), "australia": au("bajo", "Exercise normal safety precautions", "india") },
  bd:  { "uk-fcdo": uk("bajo", "Exercise normal precautions", "bangladesh"), "canada": ca("bajo", "Exercise normal precautions", "bangladesh"), "australia": au("bajo", "Exercise normal safety precautions", "bangladesh") },
  id:  { "uk-fcdo": uk("bajo", "Exercise normal precautions", "indonesia"), "canada": ca("bajo", "Exercise normal precautions", "indonesia"), "australia": au("bajo", "Exercise normal safety precautions", "indonesia") },
  sa:  { "uk-fcdo": uk("bajo", "Exercise normal precautions", "saudi-arabia"), "canada": ca("bajo", "Exercise normal precautions", "saudi-arabia"), "australia": au("bajo", "Exercise normal safety precautions", "saudi-arabia") },
  ae:  { "uk-fcdo": uk("bajo", "Exercise normal precautions", "united-arab-emirates"), "canada": ca("bajo", "Exercise normal precautions", "united-arab-emirates"), "australia": au("bajo", "Exercise normal safety precautions", "united-arab-emirates") },
  jo:  { "uk-fcdo": uk("bajo", "Exercise normal precautions", "jordan"), "canada": ca("bajo", "Exercise normal precautions", "jordan"), "australia": au("bajo", "Exercise normal safety precautions", "jordan") },
};
