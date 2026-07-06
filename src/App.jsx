import React, { useState, useMemo } from "react";
import {
  Stethoscope, Activity, AlertTriangle, Printer, Copy, RotateCcw, FileText,
  HeartPulse, Wind, FlaskConical, Pill, ClipboardCheck, Check, User, Scissors, Bed,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────
   Valoración Preanestésica — herramienta de apoyo clínico
   Documenta la evaluación y calcula escalas de riesgo en tiempo real.
   No reemplaza el juicio clínico.
   ────────────────────────────────────────────────────────────────────────── */

const LEVEL = {
  low:  { dot: "bg-emerald-500", text: "text-emerald-700", bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  mod:  { dot: "bg-amber-500",   text: "text-amber-700",   bar: "bg-amber-500",   chip: "bg-amber-50 text-amber-700 ring-amber-200" },
  high: { dot: "bg-red-500",     text: "text-red-700",     bar: "bg-red-500",     chip: "bg-red-50 text-red-700 ring-red-200" },
  none: { dot: "bg-stone-300",   text: "text-stone-400",   bar: "bg-stone-300",   chip: "bg-stone-50 text-stone-400 ring-stone-200" },
};

const num = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};

const initial = {
  // Paciente
  nombre: "", documento: "", fechaNacimiento: "", edad: "", sexo: "", gestacion: "no", fum: "", semanasGestacion: "", peso: "", talla: "", cuello: "", cfs: "",
  // Procedimiento
  cirugia: "", fecha: "", caracter: "electiva", ncepod: "", lateralidad: "na", altoRiesgoQx: false, procedimientoEsc: "",
  // Antecedentes
  tieneAntecedentes: "si",
  hta: false, cardiopatiaIsq: false, cardiopatiaRevasc: "ninguna", cardiopatiaDetalle: "", icc: false, arritmia: false, valvulopatia: false,
  epoc: false, asma: false, asmaExacerbacion: "", saos: false, diabetes: false, diabetesInsulina: false,
  hipotiroidismo: false, tiroidesTipo: "", tiroidesControl: "controlado", erc: false, hepatopatia: false,
  cpBili: "1", cpAlb: "1", cpInr: "1", cpAscitis: "1", cpEncef: "1", ecv: false, ecvDetalle: "", rge: false,
  coagulopatia: false, cancer: false, cancerTipo: "", antecedentesOtros: "",
  iccNyha: "", iccFevi: "", iccEtiologia: "",
  epocO2: false, epocDetalle: "", saosCpap: "", saosTitulacion: "",
  valvTipo: "", valvSeveridad: "", valvProtesis: "no",
  arrTipo: "", arrMarcapasos: false, arrAnticoag: false,
  ercEstadio: "", ercDialisis: "no",
  // Índice de comorbilidad de Charlson
  ch_mi: false, ch_icc: false, ch_evp: false, ch_ecv: false, ch_demencia: false,
  ch_epoc: false, ch_conectivo: false, ch_ulcera: false, ch_hemiplejia: false,
  ch_renal: false, ch_leucemia: false, ch_linfoma: false, ch_sida: false,
  ch_diabetes: "no", ch_hepatopatia: "no", ch_tumor: "no",
  // Anestésico-quirúrgicos previos
  tieneAntecedentesQx: "si", cirugiasPrevias: "", anestesiaPrevia: [], vadPrevia: false, nvpoPrevia: false, hxFamiliarHM: false, complicaciones: "", transfusion: "", transfusionDetalle: "",
  // Medicación / alergias
  tomaMedicacion: "", medicacion: "", anticoagulantes: "", anticoagDetalle: "", tieneAlergias: "", alergias: "",
  // Hábitos / capacidad funcional
  tabaco: "no", tabacoSusp: "", cigarrillosDia: "", aniosFuma: "", alcohol: "no", drogas: false, sustanciasDetalle: "", mets: "ge4",
  capMetodo: "mets", metCat: "", dasi: new Array(12).fill(false), estadoFuncional: "independiente",
  // Examen físico / vía aérea
  ta: "", fc: "", spo2: "", soplo: "ausente", oxigeno: "no", fio2: "", oxDispositivo: "", oxViaArtificial: "iot", oxTamano: "", exCardio: "", exResp: "", exAbdomen: "", exNeuro: "",
  dolorToracico: "ausente", anginaCCS: "", sintResp: [], sintFalla: [], rosObs: "",
  mallampati: "", mordida: "", aperturaOral: "ge3", distTiro: "ge6", movilidadCervical: "normal", viaAereaObs: "", dentadura: "completa",
  aspiracion: "bajo", aspiracionFactores: [],
  ronquido: false, cansancio: false, apneas: false,
  // Apfel extra
  opioidesPostop: false,
  // Laboratorio / estudios
  hb: "", hematocrito: "", plaquetas: "", inr: "", creatinina: "", glucemia: "",
  hbObjetivo: "7", cgPeso: "real",
  ariscatInfeccion: false, ariscatIncision: "periferica", ariscatDuracion: "lt2",
  ecg: "", rxTorax: "", otrosEstudios: "",
  // ASA
  asa: "", asaUrgencia: false,
  // Plan
  tipoAnestesia: [], ayuno: "", consideraciones: "", medPeriop: [], medPeriopPlan: "", anticoagPlanDetalle: "",
  ayunoIncluir: true, ayunoClaros: "2", ayunoLigera: "6", ayunoCopiosa: "8",
  conclusion: "", recomendaciones: "",
  // Reservas y disposición postoperatoria
  reservaCama: "ninguna", reservaHemo: false, solicitaEstudios: "no", examenesAdic: [], examenesAdicOtros: "",
  hemoCGR: "", hemoPFC: "", hemoPlaq: "", hemoCrio: "", reservaObs: "", evaluador: "", evaluadorRegistro: "", fechaValoracion: "",
};

export default function App() {
  const [f, setF] = useState(initial);
  const [view, setView] = useState("form"); // form | report
  const [copied, setCopied] = useState(false);
  const [copiedHC, setCopiedHC] = useState(false);

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const toggle = (k) => setF((p) => ({ ...p, [k]: !p[k] }));
  const toggleArr = (k, v) =>
    setF((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));
  const toggleAnestesia = (t) =>
    setF((p) => {
      if (t === "Ninguna") return { ...p, anestesiaPrevia: p.anestesiaPrevia.includes("Ninguna") ? [] : ["Ninguna"] };
      const has = p.anestesiaPrevia.includes(t);
      const arr = (has ? p.anestesiaPrevia.filter((x) => x !== t) : [...p.anestesiaPrevia, t]).filter((x) => x !== "Ninguna");
      return { ...p, anestesiaPrevia: arr };
    });
  const toggleArrAnticoag = () =>
    setF((p) => {
      const next = !p.arrAnticoag;
      return { ...p, arrAnticoag: next, anticoagulantes: next ? "si" : p.anticoagulantes };
    });
  const setValvProtesis = (v) =>
    setF((p) => ({ ...p, valvProtesis: v, anticoagulantes: v === "mecanica" ? "si" : p.anticoagulantes }));
  const setCaracter = (v) =>
    setF((p) => { const ncepod = CAR_TO_NCE[v]; return { ...p, caracter: v, ncepod, asaUrgencia: v === "urgente" || v === "emergencia" || ncepod === "inmediata" || ncepod === "urgente" }; });
  const setNcepod = (v) =>
    setF((p) => ({ ...p, ncepod: v, asaUrgencia: p.caracter === "urgente" || p.caracter === "emergencia" || v === "inmediata" || v === "urgente" }));
  const chHepClass = (p) => {
    const cp = (parseInt(p.cpBili) || 1) + (parseInt(p.cpAlb) || 1) + (parseInt(p.cpInr) || 1) + (parseInt(p.cpAscitis) || 1) + (parseInt(p.cpEncef) || 1);
    return cp <= 6 ? "leve" : "grave";
  };
  const CH_LINK = { cardiopatiaIsq: "ch_mi", icc: "ch_icc", ecv: "ch_ecv", epoc: "ch_epoc" };
  const renalSevere = (p) => num(p.creatinina) > 3 || (p.ercDialisis && p.ercDialisis !== "no");
  const toggleAnt = (k) =>
    setF((p) => {
      const on = !p[k];
      const next = { ...p, [k]: on };
      if (k in CH_LINK) next[CH_LINK[k]] = on;
      else if (k === "erc") { if (!on) next.ercDialisis = "no"; next.ch_renal = renalSevere(next); }
      else if (k === "diabetes") next.ch_diabetes = on ? "simple" : "no";
      else if (k === "cancer") next.ch_tumor = on ? "local" : "no";
      else if (k === "hepatopatia") next.ch_hepatopatia = on ? chHepClass(p) : "no";
      return next;
    });
  const setCrea = (v) => setF((p) => { const n = { ...p, creatinina: v }; n.ch_renal = renalSevere(n); return n; });
  const setDialisis = (v) => setF((p) => { const n = { ...p, ercDialisis: v }; n.ch_renal = renalSevere(n); return n; });
  const setCp = (field, v) =>
    setF((p) => {
      const next = { ...p, [field]: v };
      if (p.hepatopatia) next.ch_hepatopatia = chHepClass(next);
      return next;
    });
  const setTieneAntecedentes = (v) =>
    setF((p) => {
      if (v === "si") return { ...p, tieneAntecedentes: v };
      const keys = ["hta", "cardiopatiaIsq", "cardiopatiaRevasc", "cardiopatiaDetalle", "icc", "arritmia", "valvulopatia", "ecv", "epoc", "asma", "saos", "diabetes", "hipotiroidismo", "erc", "hepatopatia", "rge", "coagulopatia", "cancer", "iccNyha", "iccFevi", "iccEtiologia", "epocO2", "epocDetalle", "asmaExacerbacion", "saosCpap", "saosTitulacion", "diabetesInsulina", "tiroidesTipo", "tiroidesControl", "cancerTipo", "cpBili", "cpAlb", "cpInr", "cpAscitis", "cpEncef", "ecvDetalle", "valvTipo", "valvSeveridad", "valvProtesis", "arrTipo", "arrMarcapasos", "arrAnticoag", "ercEstadio", "ercDialisis", "antecedentesOtros", "ch_mi", "ch_icc", "ch_ecv", "ch_epoc", "ch_renal", "ch_diabetes", "ch_tumor", "ch_hepatopatia"];
      const reset = {};
      for (const k of keys) reset[k] = initial[k];
      return { ...p, ...reset, tieneAntecedentes: v };
    });
  const setTieneAntecedentesQx = (v) =>
    setF((p) => {
      if (v === "si") return { ...p, tieneAntecedentesQx: v };
      const keys = ["cirugiasPrevias", "anestesiaPrevia", "vadPrevia", "nvpoPrevia", "hxFamiliarHM", "complicaciones"];
      const reset = {};
      for (const k of keys) reset[k] = initial[k];
      return { ...p, ...reset, tieneAntecedentesQx: v };
    });
  const setFechaNac = (v) =>
    setF((p) => {
      let edad = p.edad;
      if (v) {
        const d = new Date(v), now = new Date();
        let a = now.getFullYear() - d.getFullYear();
        const m = now.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
        if (a >= 0 && a < 130) edad = String(a);
      }
      return { ...p, fechaNacimiento: v, edad };
    });

  const r = useMemo(() => compute(f), [f]);

  const copyReport = async () => {
    const txt = buildReport(f, r);
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(true);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); setCopied(true); } catch {}
      document.body.removeChild(ta);
    }
    setTimeout(() => setCopied(false), 1800);
  };

  const reset = () => { setF(initial); setView("form"); };

  const copyHC = async () => {
    const txt = buildHC(f, r);
    try {
      await navigator.clipboard.writeText(txt);
      setCopiedHC(true);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); setCopiedHC(true); } catch {}
      document.body.removeChild(ta);
    }
    setTimeout(() => setCopiedHC(false), 1800);
  };

  if (view === "report") {
    return <Report f={f} r={r} onBack={() => setView("form")} onCopy={copyReport} copied={copied} onCopyHC={copyHC} copiedHC={copiedHC} />;
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 font-sans antialiased">
      <style>{`@media print { .no-print { display:none !important; } }`}</style>

      {/* Header */}
      <header className="bg-teal-900 text-stone-50">
        <div className="mx-auto max-w-6xl px-5 py-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-700/60 ring-1 ring-teal-600/50">
            <Stethoscope size={20} className="text-teal-50" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold tracking-tight leading-none">Valoración Preanestésica</h1>
            <p className="mt-1 text-[12px] text-teal-200/90">Documentación clínica y cálculo de escalas de riesgo</p>
          </div>
          <button onClick={reset}
            className="no-print inline-flex items-center gap-1.5 rounded-md bg-teal-800/70 px-3 py-2 text-[13px] font-medium text-teal-50 ring-1 ring-teal-600/50 hover:bg-teal-800">
            <RotateCcw size={14} /> Nueva
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_348px]">
          {/* ── Formulario ── */}
          <div className="space-y-5">

            <Section icon={User} title="Datos del paciente">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field label="Nombre" className="col-span-2"><Text v={f.nombre} on={(v) => set("nombre", v)} /></Field>
                <Field label="Documento"><Text v={f.documento} on={(v) => set("documento", v)} /></Field>
                <Field label="Fecha de nacimiento"><Text type="date" v={f.fechaNacimiento} on={setFechaNac} /></Field>
                <Field label="Edad (años)"><Text type="number" v={f.edad} on={(v) => set("edad", v)} /></Field>
                <Field label="Sexo">
                  <Seg value={f.sexo} on={(v) => set("sexo", v)} options={[{ v: "M", label: "M" }, { v: "F", label: "F" }]} />
                </Field>
              </div>
            </Section>

            <Section icon={Scissors} title="Procedimiento">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Cirugía programada" className="sm:col-span-2"><Text v={f.cirugia} on={(v) => set("cirugia", v)} /></Field>
                <Field label="Procedimiento — riesgo cardíaco (ESC 2022)" className="sm:col-span-2">
                  <select value={f.procedimientoEsc} onChange={(e) => { const v = e.target.value; setF((p) => ({ ...p, procedimientoEsc: v, altoRiesgoQx: RCRI_HIGH_PROCS.has(v) })); }} className={`${inputCls} appearance-none`}>
                    <option value="">— Seleccione un procedimiento —</option>
                    <optgroup label="Bajo riesgo (< 1%)">
                      {PROC_ESC.bajo.map((p) => <option key={p} value={p}>{p}</option>)}
                    </optgroup>
                    <optgroup label="Riesgo intermedio (1–5%)">
                      {PROC_ESC.intermedio.map((p) => <option key={p} value={p}>{p}</option>)}
                    </optgroup>
                    <optgroup label="Alto riesgo (> 5%)">
                      {PROC_ESC.alto.map((p) => <option key={p} value={p}>{p}</option>)}
                    </optgroup>
                  </select>
                </Field>
                <Field label="Fecha"><Text type="date" v={f.fecha} on={(v) => set("fecha", v)} /></Field>
                <Field label="Carácter">
                  <Seg value={f.caracter} on={setCaracter}
                    options={[{ v: "electiva", label: "Electiva" }, { v: "urgente", label: "Urgente" }, { v: "emergencia", label: "Emergencia" }]} />
                </Field>
              </div>
              <Field label="Lateralidad" className="mt-3">
                <Seg value={f.lateralidad} on={(v) => set("lateralidad", v)}
                  options={[{ v: "na", label: "No aplica" }, { v: "izquierda", label: "Izquierda" }, { v: "derecha", label: "Derecha" }, { v: "bilateral", label: "Bilateral" }]} />
              </Field>
              <Field label="Urgencia clínica (NCEPOD 2004)" className="mt-3">
                <Seg value={f.ncepod} on={setNcepod}
                  options={NCEPOD.map((o) => ({
                    v: o.v,
                    label: (
                      <span className="flex flex-col items-center leading-tight">
                        <span>{o.sg}</span>
                        <span className="text-[10px] font-normal opacity-70">{o.t}</span>
                      </span>
                    ),
                  }))} />
              </Field>
              <Check2 className="mt-3" checked={f.altoRiesgoQx} on={() => toggle("altoRiesgoQx")}
                label="Cirugía de alto riesgo (intraperitoneal, intratorácica o vascular suprainguinal)" />
              <p className="mt-1.5 text-[11px] text-stone-400">Se ajusta automáticamente al elegir el procedimiento ESC; puede modificarla manualmente.</p>
            </Section>

            <Section icon={HeartPulse} title="Antecedentes patológicos">
              <Field label="¿Antecedentes patológicos?">
                <Seg value={f.tieneAntecedentes} on={setTieneAntecedentes}
                  options={[{ v: "niega", label: "Niega" }, { v: "si", label: "Sí" }]} />
              </Field>
              {f.tieneAntecedentes === "si" && (<>
              <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                {[
                  ["hta", "Hipertensión arterial"], ["cardiopatiaIsq", "Cardiopatía isquémica"],
                  ["icc", "Insuficiencia cardíaca"], ["arritmia", "Arritmia"],
                  ["valvulopatia", "Valvulopatía"], ["ecv", "Enf. cerebrovascular (ACV/AIT)"],
                  ["epoc", "EPOC"], ["asma", "Asma"], ["saos", "SAOS conocido"],
                  ["diabetes", "Diabetes mellitus"],
                  ["hipotiroidismo", "Patología tiroidea"], ["erc", "Enf. renal crónica"],
                  ["hepatopatia", "Hepatopatía"], ["rge", "Reflujo gastroesofágico"],
                  ["coagulopatia", "Coagulopatía / trastorno hemorrágico"],
                  ["cancer", "Cáncer (malignidad activa en los últimos 5 años)"],
                ].map(([k, label]) => (
                  <Check2 key={k} checked={f[k]} on={() => toggleAnt(k)} label={label} />
                ))}
              </div>
              {f.cardiopatiaIsq && (
                <div className="mt-3 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Cardiopatía isquémica</p>
                  <Field label="Revascularización">
                    <Seg value={f.cardiopatiaRevasc} on={(v) => set("cardiopatiaRevasc", v)}
                      options={[{ v: "ninguna", label: "Ninguna" }, { v: "icp", label: "ICP (stent)" }, { v: "cabg", label: "Quirúrgica" }, { v: "ambas", label: "Ambas" }]} />
                  </Field>
                  <Field label="Datos adicionales (anatomía, vasos, fecha…)" className="mt-3">
                    <Area v={f.cardiopatiaDetalle} on={(v) => set("cardiopatiaDetalle", v)} rows={2} placeholder="p. ej. stent en DA 2021, enfermedad de 2 vasos, FEVI conservada" />
                  </Field>
                </div>
              )}
              {f.icc && (
                <div className="mt-3 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Insuficiencia cardíaca</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Clase funcional NYHA">
                      <Seg value={f.iccNyha} on={(v) => set("iccNyha", v)}
                        options={[{ v: "1", label: "I" }, { v: "2", label: "II" }, { v: "3", label: "III" }, { v: "4", label: "IV" }]} />
                    </Field>
                    <Field label="FEVI">
                      <Seg value={f.iccFevi} on={(v) => set("iccFevi", v)}
                        options={[{ v: "reducida", label: "Reducida" }, { v: "levemente", label: "Lev. red." }, { v: "preservada", label: "Preservada" }, { v: "desconocida", label: "Desc." }]} />
                    </Field>
                  </div>
                  <Field label="Etiología (si se conoce)" className="mt-3">
                    <Text v={f.iccEtiologia} on={(v) => set("iccEtiologia", v)} placeholder="p.ej. isquémica, hipertensiva, valvular, dilatada…" />
                  </Field>
                </div>
              )}
              {f.epoc && (
                <div className="mt-3 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">EPOC</p>
                  <Check2 checked={f.epocO2} on={() => toggle("epocO2")} label="Oxígeno domiciliario" />
                  <Field label="Detalle (tratamiento, agudizaciones)" className="mt-3">
                    <Text v={f.epocDetalle} on={(v) => set("epocDetalle", v)} />
                  </Field>
                </div>
              )}
              {f.asma && (
                <div className="mt-3 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Asma</p>
                  <Field label="Tiempo desde la última exacerbación">
                    <Select value={f.asmaExacerbacion} on={(v) => set("asmaExacerbacion", v)}
                      options={[
                        { v: "", label: "—" },
                        { v: "ninguna", label: "Sin exacerbaciones" },
                        { v: "lt4", label: "< 4 semanas" },
                        { v: "4a12", label: "4–12 semanas" },
                        { v: "gt12", label: "> 12 semanas" },
                      ]} />
                  </Field>
                </div>
              )}
              {f.hipotiroidismo && (
                <div className="mt-3 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Patología tiroidea</p>
                  <Field label="Tipo">
                    <Select value={f.tiroidesTipo} on={(v) => set("tiroidesTipo", v)}
                      options={[
                        { v: "", label: "—" },
                        { v: "hipotiroidismo", label: "Hipotiroidismo" },
                        { v: "hipertiroidismo", label: "Hipertiroidismo" },
                        { v: "eutiroideo", label: "Eutiroideo (en tratamiento)" },
                        { v: "nodulo", label: "Bocio / nódulo" },
                        { v: "otro", label: "Otro" },
                      ]} />
                  </Field>
                  <Field label="Control" className="mt-3">
                    <Seg value={f.tiroidesControl} on={(v) => set("tiroidesControl", v)}
                      options={[{ v: "controlado", label: "Controlado" }, { v: "no_controlado", label: "No controlado" }]} />
                  </Field>
                </div>
              )}
              {f.diabetes && (
                <div className="mt-3 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Diabetes mellitus</p>
                  <Field label="¿Tratamiento con insulina?">
                    <Seg value={f.diabetesInsulina ? "si" : "no"} on={(v) => set("diabetesInsulina", v === "si")}
                      options={[{ v: "no", label: "No" }, { v: "si", label: "Sí" }]} />
                  </Field>
                </div>
              )}
              {f.cancer && (
                <div className="mt-3 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Cáncer</p>
                  <Field label="Tipo / localización del cáncer">
                    <Text v={f.cancerTipo} on={(v) => set("cancerTipo", v)} placeholder="p. ej. adenocarcinoma de colon, en quimioterapia" />
                  </Field>
                </div>
              )}
              {f.hepatopatia && (
                <div className="mt-3 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Hepatopatía — Child-Pugh</p>
                  <div className="space-y-3">
                    <Field label="Bilirrubina total (mg/dL)">
                      <Seg value={f.cpBili} on={(v) => setCp("cpBili", v)} options={[{ v: "1", label: "< 2" }, { v: "2", label: "2–3" }, { v: "3", label: "> 3" }]} />
                    </Field>
                    <Field label="Albúmina (g/dL)">
                      <Seg value={f.cpAlb} on={(v) => setCp("cpAlb", v)} options={[{ v: "1", label: "> 3.5" }, { v: "2", label: "2.8–3.5" }, { v: "3", label: "< 2.8" }]} />
                    </Field>
                    <Field label="INR">
                      <Seg value={f.cpInr} on={(v) => setCp("cpInr", v)} options={[{ v: "1", label: "< 1.7" }, { v: "2", label: "1.7–2.3" }, { v: "3", label: "> 2.3" }]} />
                    </Field>
                    <Field label="Ascitis">
                      <Seg value={f.cpAscitis} on={(v) => setCp("cpAscitis", v)} options={[{ v: "1", label: "Ausente" }, { v: "2", label: "Leve" }, { v: "3", label: "Moderada-grave" }]} />
                    </Field>
                    <Field label="Encefalopatía">
                      <Seg value={f.cpEncef} on={(v) => setCp("cpEncef", v)} options={[{ v: "1", label: "Ausente" }, { v: "2", label: "Grado I–II" }, { v: "3", label: "Grado III–IV" }]} />
                    </Field>
                  </div>
                  {r.childPugh && (
                    <div className={`mt-3 rounded-md p-2.5 text-center ring-1 ${LEVEL[r.childPugh.level].chip}`}>
                      <p className="text-[13px] font-semibold">Child-Pugh {r.childPugh.score} · Clase {r.childPugh.clase}</p>
                    </div>
                  )}
                  <p className="mt-1.5 text-[11px] text-stone-400">A: 5–6 · B: 7–9 · C: 10–15.</p>
                </div>
              )}
              {f.ecv && (
                <div className="mt-3 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Enfermedad cerebrovascular</p>
                  <Field label="Detalle (tiempo de evolución, anatomía/territorio, secuelas)">
                    <Area v={f.ecvDetalle} on={(v) => set("ecvDetalle", v)} rows={2} placeholder="p. ej. ACV isquémico ACM izquierda hace 2 años, hemiparesia derecha residual" />
                  </Field>
                </div>
              )}
              {f.saos && (
                <div className="mt-3 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">SAOS</p>
                  <Field label="¿Usa CPAP?">
                    <Seg value={f.saosCpap} on={(v) => set("saosCpap", v)}
                      options={[{ v: "si", label: "Sí" }, { v: "no", label: "No" }]} />
                  </Field>
                  {f.saosCpap === "si" && (
                    <Field label="Titulación (cmH₂O), si se conoce" className="mt-3">
                      <Text type="number" v={f.saosTitulacion} on={(v) => set("saosTitulacion", v)} placeholder="p. ej. 10" />
                    </Field>
                  )}
                </div>
              )}
              {f.valvulopatia && (
                <div className="mt-3 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Valvulopatía</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Tipo (válvula y lesión)"><Text v={f.valvTipo} on={(v) => set("valvTipo", v)} placeholder="p.ej. estenosis aórtica, insuf. mitral…" /></Field>
                    <Field label="Severidad">
                      <Seg value={f.valvSeveridad} on={(v) => set("valvSeveridad", v)}
                        options={[{ v: "leve", label: "Leve" }, { v: "moderada", label: "Moderada" }, { v: "grave", label: "Grave" }]} />
                    </Field>
                  </div>
                  <Field label="Prótesis valvular" className="mt-3">
                    <Seg value={f.valvProtesis} on={setValvProtesis}
                      options={[{ v: "no", label: "No" }, { v: "mecanica", label: "Mecánica" }, { v: "biologica", label: "Biológica" }]} />
                  </Field>
                </div>
              )}
              {f.arritmia && (
                <div className="mt-3 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Arritmia</p>
                  <Field label="Tipo"><Text v={f.arrTipo} on={(v) => set("arrTipo", v)} placeholder="p.ej. fibrilación auricular, flutter, bloqueo AV…" /></Field>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Check2 checked={f.arrMarcapasos} on={() => toggle("arrMarcapasos")} label="Marcapasos / DAI" />
                    <Check2 checked={f.arrAnticoag} on={toggleArrAnticoag} label="Anticoagulado por la arritmia" />
                  </div>
                </div>
              )}
              {f.erc && (
                <div className="mt-3 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Enfermedad renal crónica</p>
                  <Field label="Estadio (KDIGO)">
                    <Seg value={f.ercEstadio} on={(v) => set("ercEstadio", v)}
                      options={[{ v: "G1", label: "G1" }, { v: "G2", label: "G2" }, { v: "G3a", label: "G3a" }, { v: "G3b", label: "G3b" }, { v: "G4", label: "G4" }, { v: "G5", label: "G5" }]} />
                  </Field>
                  <Field label="Diálisis" className="mt-3">
                    <Seg value={f.ercDialisis} on={(v) => setDialisis(v)}
                      options={[{ v: "no", label: "No" }, { v: "hd", label: "Hemodiálisis" }, { v: "dp", label: "Peritoneal" }]} />
                  </Field>
                </div>
              )}
              <Field label="Otros antecedentes" className="mt-3"><Area v={f.antecedentesOtros} on={(v) => set("antecedentesOtros", v)} rows={2} /></Field>
              </>)}
            </Section>

            {f.sexo === "F" && (
              <Section icon={HeartPulse} title="Estado gestacional">
                <Field label="¿Embarazo?">
                  <Seg value={f.gestacion} on={(v) => set("gestacion", v)}
                    options={[{ v: "no", label: "No gestante" }, { v: "posible", label: "Posible" }, { v: "si", label: "Gestante" }]} />
                </Field>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="FUM (última menstruación)"><Text type="date" v={f.fum} on={(v) => set("fum", v)} /></Field>
                  {f.gestacion === "si" && <Field label="Semanas de gestación"><Text type="number" v={f.semanasGestacion} on={(v) => set("semanasGestacion", v)} /></Field>}
                </div>
              </Section>
            )}

            <Section icon={Activity} title="Antecedentes anestésico-quirúrgicos">
              <Field label="¿Antecedentes quirúrgico-anestésicos?">
                <Seg value={f.tieneAntecedentesQx} on={setTieneAntecedentesQx}
                  options={[{ v: "niega", label: "Niega" }, { v: "si", label: "Sí" }]} />
              </Field>
              {f.tieneAntecedentesQx === "si" && (<>
              <Field label="Cirugías y anestesias previas" className="mt-3"><Area v={f.cirugiasPrevias} on={(v) => set("cirugiasPrevias", v)} rows={2} /></Field>
              <Field label="Tipos de anestesia recibidos previamente" className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {["General", "Regional", "Neuroaxial", "Sedación", "Combinada", "Local", "Ninguna"].map((t) => (
                    <button key={t} onClick={() => toggleAnestesia(t)}
                      className={`rounded-full px-3 py-1.5 text-[13px] ring-1 transition ${
                        f.anestesiaPrevia.includes(t)
                          ? "bg-teal-700 text-white ring-teal-700"
                          : "bg-white text-stone-600 ring-stone-200 hover:ring-stone-300"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Check2 checked={f.vadPrevia} on={() => toggle("vadPrevia")} label="Vía aérea difícil previa documentada" />
                <Check2 checked={f.nvpoPrevia} on={() => toggle("nvpoPrevia")} label="Náusea/vómito postop. o cinetosis" />
                <Check2 checked={f.hxFamiliarHM} on={() => toggle("hxFamiliarHM")} label="Hist. familiar de hipertermia maligna" />
              </div>
              <Field label="Complicaciones anestésicas previas" className="mt-3"><Area v={f.complicaciones} on={(v) => set("complicaciones", v)} rows={2} /></Field>
              </>)}
              <Field label="Antecedente de transfusión" className="mt-3">
                <Seg value={f.transfusion} on={(v) => set("transfusion", v)}
                  options={[{ v: "no", label: "No" }, { v: "si", label: "Sí" }, { v: "rechaza", label: "Rechaza hemoderivados" }]} />
              </Field>
              {f.transfusion === "si" && (
                <Field label="Detalle de transfusión (fecha, motivo, reacciones)" className="mt-3">
                  <Text v={f.transfusionDetalle} on={(v) => set("transfusionDetalle", v)} placeholder="p. ej. 2022, sangrado quirúrgico, sin reacciones" />
                </Field>
              )}
            </Section>

            <Section icon={Pill} title="Medicación y alergias">
              <Field label="¿Medicación habitual?">
                <Seg value={f.tomaMedicacion} on={(v) => set("tomaMedicacion", v)}
                  options={[{ v: "no", label: "No" }, { v: "si", label: "Sí" }]} />
              </Field>
              {f.tomaMedicacion === "si" && (
                <Field label="Detalle de medicación" className="mt-3">
                  <Area v={f.medicacion} on={(v) => set("medicacion", v)} rows={2} placeholder="Fármaco, dosis, última toma…" />
                </Field>
              )}

              <Field label="¿Anticoagulantes / antiagregantes?" className="mt-3">
                <Seg value={f.anticoagulantes} on={(v) => set("anticoagulantes", v)}
                  options={[{ v: "no", label: "No" }, { v: "si", label: "Sí" }]} />
              </Field>
              {f.anticoagulantes === "si" && (
                <Field label="Detalle (fármaco, última dosis, pauta)" className="mt-3">
                  <Area v={f.anticoagDetalle} on={(v) => set("anticoagDetalle", v)} rows={2} placeholder="p.ej. warfarina / ASA / rivaroxabán; última toma; plan de suspensión o puente" />
                  <a href="https://qxaapp.secardiologia.es/farmacos" target="_blank" rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-teal-800 px-3 py-2 text-[13px] font-medium text-white hover:bg-teal-900">
                    Abrir QxAApp (suspensión de antitrombóticos, SEC) →
                  </a>
                  <p className="mt-1 text-[11px] text-stone-400">Herramienta web externa de la Sociedad Española de Cardiología (consenso Rev Esp Cardiol 2018) para la pauta de suspensión/puente.</p>
                </Field>
              )}

              <Field label="¿Alergias conocidas?" className="mt-3">
                <Seg value={f.tieneAlergias} on={(v) => set("tieneAlergias", v)}
                  options={[{ v: "no", label: "No" }, { v: "si", label: "Sí" }]} />
              </Field>
              {f.tieneAlergias === "si" && (
                <Field label="Detalle de alergias" className="mt-3">
                  <Area v={f.alergias} on={(v) => set("alergias", v)} rows={2} placeholder="Medicamentos, látex, alimentos, tipo de reacción…" />
                </Field>
              )}
            </Section>

            <Section icon={HeartPulse} title="Índice de comorbilidad de Charlson">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Diabetes">
                  <Seg value={f.ch_diabetes} on={(v) => set("ch_diabetes", v)}
                    options={[{ v: "no", label: "No" }, { v: "simple", label: "Sin compl. (1)" }, { v: "organo", label: "Daño órgano (2)" }]} />
                </Field>
                <Field label="Hepatopatía">
                  <Seg value={f.ch_hepatopatia} on={(v) => set("ch_hepatopatia", v)}
                    options={[{ v: "no", label: "No" }, { v: "leve", label: "Leve (1)" }, { v: "grave", label: "Mod-grave (3)" }]} />
                </Field>
                <Field label="Tumor sólido">
                  <Seg value={f.ch_tumor} on={(v) => set("ch_tumor", v)}
                    options={[{ v: "no", label: "No" }, { v: "local", label: "Localizado (2)" }, { v: "meta", label: "Metástasis (6)" }]} />
                </Field>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                {[
                  ["ch_mi", "Infarto de miocardio (1)"], ["ch_icc", "Insuficiencia cardíaca (1)"],
                  ["ch_evp", "Enf. vascular periférica (1)"], ["ch_ecv", "Enf. cerebrovascular (1)"],
                  ["ch_demencia", "Demencia (1)"], ["ch_epoc", "Enf. pulmonar crónica (1)"],
                  ["ch_conectivo", "Enf. del tejido conectivo (1)"], ["ch_ulcera", "Úlcera péptica (1)"],
                  ["ch_hemiplejia", "Hemiplejía (2)"], ["ch_renal", "Enf. renal moderada-grave (2)"],
                  ["ch_leucemia", "Leucemia (2)"], ["ch_linfoma", "Linfoma (2)"],
                  ["ch_sida", "SIDA (6)"],
                ].map(([k, label]) => (
                  <Check2 key={k} checked={f[k]} on={() => toggle(k)} label={label} />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[
                  ["Comorbilidad", r.charlson.comorb],
                  ["Puntos edad", "+" + r.charlson.age],
                  ["Total", r.charlson.total],
                  ["Superv. 10 a", r.charlson.surv + "%"],
                ].map(([k, v], i) => (
                  <div key={i} className={`rounded-md p-2.5 text-center ring-1 ${i === 2 ? LEVEL[r.charlson.level].chip : "bg-stone-50 text-stone-700 ring-stone-200"}`}>
                    <p className="font-mono text-[17px] font-semibold tabular-nums leading-none">{v}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-stone-500">{k}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-stone-400">Los puntos por edad se calculan automáticamente (+1 por década a partir de los 50 años).</p>
            </Section>

            <Section icon={Wind} title="Hábitos y capacidad funcional">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Tabaquismo">
                  <Seg value={f.tabaco} on={(v) => set("tabaco", v)}
                    options={[{ v: "no", label: "Nunca" }, { v: "ex", label: "Ex" }, { v: "activo", label: "Activo" }]} />
                </Field>
                <Field label="Alcohol">
                  <Seg value={f.alcohol} on={(v) => set("alcohol", v)}
                    options={[{ v: "no", label: "No" }, { v: "social", label: "Social" }, { v: "abuso", label: "Abuso" }]} />
                </Field>
              </div>
              {f.tabaco === "ex" && (
                <Field label="Suspensión del tabaco" className="mt-3">
                  <Seg value={f.tabacoSusp} on={(v) => set("tabacoSusp", v)}
                    options={[{ v: "lt1", label: "Hace < 1 año" }, { v: "ge1", label: "Hace ≥ 1 año" }]} />
                </Field>
              )}
              {(f.tabaco === "activo" || f.tabaco === "ex") && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <Field label="Cigarrillos/día"><Text type="number" v={f.cigarrillosDia} on={(v) => set("cigarrillosDia", v)} /></Field>
                  <Field label="Años fumando"><Text type="number" v={f.aniosFuma} on={(v) => set("aniosFuma", v)} /></Field>
                  <Field label="IPA (paquetes-año)">
                    <div className="flex h-[38px] items-center rounded-md bg-stone-50 px-3 ring-1 ring-stone-200 font-mono tabular-nums text-stone-700">{r.ipa ? r.ipa.toFixed(1) : "—"}</div>
                  </Field>
                </div>
              )}
              <Check2 className="mt-3" checked={f.drogas} on={() => toggle("drogas")} label="Consumo de sustancias psicoactivas" />
              {f.drogas && (
                <Field label="Sustancias psicoactivas (tipo, frecuencia, última toma)" className="mt-3">
                  <Area v={f.sustanciasDetalle} on={(v) => set("sustanciasDetalle", v)} rows={2} placeholder="p.ej. cocaína, anfetaminas, cannabis, opioides, benzodiacepinas…" />
                </Field>
              )}

              <div className="mt-4 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Capacidad funcional</p>
                <Field label="Método de valoración">
                  <Select value={f.capMetodo} on={(v) => set("capMetodo", v)}
                    options={[
                      { v: "mets", label: "Estimar por METs" },
                      { v: "dasi", label: "Calcular con DASI (Duke)" },
                      { v: "valad", label: "Escala categórica MET (Valadkhani)" },
                    ]} />
                </Field>
                {f.capMetodo === "mets" && (
                  <Field label="METs estimados" className="mt-3">
                    <Seg value={f.mets} on={(v) => set("mets", v)}
                      options={[{ v: "lt4", label: "< 4" }, { v: "ge4", label: "≥ 4" }, { v: "desc", label: "Desconocido" }]} />
                  </Field>
                )}
                {f.capMetodo === "valad" && (
                  <div className="mt-3">
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-stone-500">Nivel de condición física</p>
                    <div className="space-y-1.5">
                      {MET_CAT.map((o) => (
                        <button key={o.v} onClick={() => set("metCat", o.v)}
                          className={`flex w-full items-start gap-2 rounded-md p-2 text-left ring-1 transition ${
                            f.metCat === o.v ? "bg-teal-50 ring-teal-300" : "bg-white ring-stone-200 hover:ring-stone-300"}`}>
                          <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[12px] tabular-nums ring-1 ${LEVEL[o.level].chip}`}>{o.met}</span>
                          <span className="text-[12.5px] leading-snug text-stone-700">{o.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[11px] text-stone-400">Escala categórica de METs en 5 niveles. Adaptado de Valadkhani et al.</p>
                  </div>
                )}
                {f.capMetodo === "dasi" && (
                  <div className="mt-3">
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-stone-500">¿Es capaz de…?</p>
                    <div className="space-y-1.5">
                      {DASI_ITEMS.map((it, i) => (
                        <Check2 key={i} checked={!!f.dasi[i]}
                          on={() => set("dasi", f.dasi.map((b, idx) => (idx === i ? !b : b)))}
                          label={it.label} />
                      ))}
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[
                        ["DASI", r.dasi.score.toFixed(2), "/ 58,2"],
                        ["VO₂ pico", r.dasi.vo2.toFixed(1), "mL/kg/min"],
                        ["METs", r.dasi.mets.toFixed(1), "estimados"],
                      ].map(([k, v, u], i) => (
                        <div key={i} className={`rounded-md p-2.5 text-center ring-1 ${i === 0 ? LEVEL[r.dasi.level].chip : "bg-white text-stone-700 ring-stone-200"}`}>
                          <p className="font-mono text-[16px] font-semibold tabular-nums leading-none">{v}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-wide text-stone-500">{k}</p>
                          <p className="text-[9.5px] text-stone-400">{u}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[11px] text-stone-400">DASI &lt; 34 se asocia a mayor riesgo perioperatorio. METs ≈ (0,43·DASI + 9,6) / 3,5.</p>
                  </div>
                )}
              </div>
              <Field label="Estado funcional — independencia para AVD (NSQIP)" className="mt-3">
                <Seg value={f.estadoFuncional} on={(v) => set("estadoFuncional", v)}
                  options={[{ v: "independiente", label: "Independiente" }, { v: "parcial", label: "Parcial" }, { v: "total", label: "Total" }]} />
                <p className="mt-1.5 text-[11px] text-stone-400">Dependencia para las actividades de la vida diaria (NSQIP): independiente / parcial / totalmente dependiente.</p>
              </Field>
            </Section>

            <Section icon={HeartPulse} title="Revisión por sistemas">
              <Field label="Dolor torácico">
                <Seg value={f.dolorToracico} on={(v) => set("dolorToracico", v)}
                  options={[{ v: "ausente", label: "Ausente" }, { v: "no_anginoso", label: "No anginoso" }, { v: "anginoso", label: "Anginoso" }]} />
              </Field>
              {f.dolorToracico === "anginoso" && (
                <Field label="Graduación de angina (CCS)" className="mt-3">
                  <div className="space-y-1.5">
                    {CCS_ANGINA.map((o) => (
                      <button key={o.n} onClick={() => set("anginaCCS", String(o.n))}
                        className={`flex w-full items-start gap-2.5 rounded-md p-2 text-left ring-1 transition ${
                          String(o.n) === f.anginaCCS ? "bg-teal-50 ring-teal-300" : "bg-white ring-stone-200 hover:ring-stone-300"}`}>
                        <span className={`grid h-6 w-12 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
                          String(o.n) === f.anginaCCS ? "bg-teal-700 text-white" : "bg-stone-100 text-stone-600"}`}>{o.label}</span>
                        <span className="text-[11.5px] leading-snug text-stone-500">{o.desc}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11px] text-stone-400">Canadian Cardiovascular Society (Campeau 1976).</p>
                </Field>
              )}
              <Field label="Síntomas respiratorios" className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {RESP_SINTOMAS.map((s) => (
                    <button key={s} onClick={() => toggleArr("sintResp", s)}
                      className={`rounded-full px-3 py-1.5 text-[12.5px] ring-1 transition ${
                        f.sintResp.includes(s) ? "bg-teal-700 text-white ring-teal-700" : "bg-white text-stone-600 ring-stone-200 hover:ring-stone-300"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Síntomas de falla cardíaca" className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {FALLA_SINTOMAS.map((s) => (
                    <button key={s} onClick={() => toggleArr("sintFalla", s)}
                      className={`rounded-full px-3 py-1.5 text-[12.5px] ring-1 transition ${
                        f.sintFalla.includes(s) ? "bg-teal-700 text-white ring-teal-700" : "bg-white text-stone-600 ring-stone-200 hover:ring-stone-300"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Otros síntomas / observaciones" className="mt-3">
                <Area v={f.rosObs} on={(v) => set("rosObs", v)} rows={2} placeholder="otros sistemas, detalles relevantes…" />
              </Field>
            </Section>

            {num(f.edad) >= 65 && (
              <Section icon={Activity} title="Fragilidad — Clinical Frailty Scale (CFS)">
                <p className="-mt-1 mb-2 text-[11px] text-stone-400">Puntúe el estado basal de las 2 semanas previas a la enfermedad aguda, no el estado actual. Validada en ≥ 65 años; fragilidad con CFS ≥ 5.</p>
                <div className="space-y-1.5">
                  {CFS_LEVELS.map((o) => (
                    <button key={o.n} onClick={() => set("cfs", String(o.n))}
                      className={`flex w-full items-start gap-2.5 rounded-md p-2 text-left ring-1 transition ${
                        String(o.n) === f.cfs ? "bg-teal-50 ring-teal-300" : "bg-white ring-stone-200 hover:ring-stone-300"}`}>
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-semibold ${
                        String(o.n) === f.cfs ? "bg-teal-700 text-white" : "bg-stone-100 text-stone-600"}`}>{o.n}</span>
                      <span className="min-w-0">
                        <span className="text-[12.5px] font-semibold text-stone-700">{o.label}</span>
                        <span className="block text-[11.5px] leading-snug text-stone-500">{o.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
                {r.frail && (
                  <div className={`mt-3 rounded-md p-2.5 text-center ring-1 ${LEVEL[r.frail.level].chip}`}>
                    <p className="text-[13px] font-semibold">CFS {r.frail.n} · {r.frail.label}{r.frail.frail ? " · Fragilidad" : ""}</p>
                  </div>
                )}
                <p className="mt-1.5 text-[11px] text-stone-400">Ref. Rockwood et al., CMAJ 2005 (CFS v2.0).</p>
              </Section>
            )}

            <Section icon={Stethoscope} title="Valoración de la vía aérea">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Mallampati">
                  <Seg value={f.mallampati} on={(v) => set("mallampati", v)}
                    options={[{ v: "1", label: "I" }, { v: "2", label: "II" }, { v: "3", label: "III" }, { v: "4", label: "IV" }]} />
                </Field>
                <Field label="Test de mordida (ULBT)">
                  <Seg value={f.mordida} on={(v) => set("mordida", v)}
                    options={[{ v: "1", label: "I" }, { v: "2", label: "II" }, { v: "3", label: "III" }]} />
                </Field>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Apertura oral">
                  <Seg value={f.aperturaOral} on={(v) => set("aperturaOral", v)}
                    options={[{ v: "ge3", label: "≥ 3 cm" }, { v: "lt3", label: "< 3 cm" }]} />
                </Field>
                <Field label="Distancia tiromentoniana">
                  <Seg value={f.distTiro} on={(v) => set("distTiro", v)}
                    options={[{ v: "ge6", label: "≥ 6 cm" }, { v: "lt6", label: "< 6 cm" }]} />
                </Field>
                <Field label="Movilidad cervical">
                  <Seg value={f.movilidadCervical} on={(v) => set("movilidadCervical", v)}
                    options={[{ v: "normal", label: "Normal" }, { v: "limitada", label: "Limitada" }]} />
                </Field>
                <Field label="Dentadura">
                  <Seg value={f.dentadura} on={(v) => set("dentadura", v)}
                    options={[{ v: "completa", label: "Completa" }, { v: "protesis", label: "Prótesis" }, { v: "edentulo", label: "Edéntulo" }]} />
                </Field>
              </div>
              <Field label="Observaciones adicionales de la vía aérea" className="mt-3">
                <Area v={f.viaAereaObs} on={(v) => set("viaAereaObs", v)} rows={2} placeholder="hallazgos relevantes, predictores adicionales, plan de manejo de vía aérea…" />
              </Field>
              <div className="mt-4 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Cribado de SAOS (STOP-BANG)</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Check2 checked={f.ronquido} on={() => toggle("ronquido")} label="Ronquido fuerte" />
                  <Check2 checked={f.cansancio} on={() => toggle("cansancio")} label="Somnolencia diurna" />
                  <Check2 checked={f.apneas} on={() => toggle("apneas")} label="Apneas observadas" />
                </div>
                <p className="mt-2 text-[11px] text-stone-400">HTA, IMC&gt;35, edad&gt;50, cuello&ge;40 cm y sexo masculino se toman automáticamente.</p>
              </div>
              <Field label="Riesgo de aspiración pulmonar" className="mt-3">
                <Seg value={f.aspiracion} on={(v) => set("aspiracion", v)}
                  options={[{ v: "bajo", label: "Bajo" }, { v: "aumentado", label: "Aumentado" }]} />
              </Field>
              {f.aspiracion === "aumentado" && (
                <Field label="Factores de riesgo de aspiración" className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {ASPIRA_FACTORES.map((s) => (
                      <button key={s} onClick={() => toggleArr("aspiracionFactores", s)}
                        className={`rounded-full px-3 py-1.5 text-[12.5px] ring-1 transition ${
                          f.aspiracionFactores.includes(s) ? "bg-teal-700 text-white ring-teal-700" : "bg-white text-stone-600 ring-stone-200 hover:ring-stone-300"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </Field>
              )}
            </Section>

            <Section icon={HeartPulse} title="Examen físico">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Field label="Peso (kg)"><Text type="number" v={f.peso} on={(v) => set("peso", v)} /></Field>
                <Field label="Talla (cm)"><Text type="number" v={f.talla} on={(v) => set("talla", v)} /></Field>
                <Field label="C. cuello (cm)"><Text type="number" v={f.cuello} on={(v) => set("cuello", v)} /></Field>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <Field label="TA (mmHg)"><Text v={f.ta} on={(v) => set("ta", v)} placeholder="120/80" /></Field>
                <Field label="FC (lpm)"><Text type="number" v={f.fc} on={(v) => set("fc", v)} /></Field>
                <Field label="SpO₂ (%)"><Text type="number" v={f.spo2} on={(v) => set("spo2", v)} /></Field>
              </div>
              <Field label="¿Oxígeno suplementario?" className="mt-3">
                <Seg value={f.oxigeno} on={(v) => set("oxigeno", v)}
                  options={[{ v: "no", label: "No" }, { v: "si", label: "Sí" }]} />
              </Field>
              {f.oxigeno === "si" && (
                <div className="mt-3 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="FiO₂ actual (%)"><Text type="number" v={f.fio2} on={(v) => set("fio2", v)} placeholder="p. ej. 28" /></Field>
                    <Field label="Dispositivo">
                      <Select value={f.oxDispositivo} on={(v) => set("oxDispositivo", v)}
                        options={[
                          { v: "", label: "—" },
                          { v: "canula", label: "Cánula nasal" },
                          { v: "mascara", label: "Máscara facial" },
                          { v: "no_reinhalacion", label: "Máscara de no reinhalación" },
                          { v: "venturi", label: "Venturi" },
                          { v: "cnaf", label: "CNAF (alto flujo)" },
                          { v: "vmni", label: "VMNI" },
                          { v: "intubacion", label: "Intubación traqueal" },
                        ]} />
                    </Field>
                  </div>
                  {f.oxDispositivo === "intubacion" && (
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Vía aérea artificial">
                        <Seg value={f.oxViaArtificial} on={(v) => set("oxViaArtificial", v)}
                          options={[{ v: "iot", label: "IOT" }, { v: "traqueostomia", label: "Traqueostomía" }]} />
                      </Field>
                      <Field label={f.oxViaArtificial === "traqueostomia" ? "Tamaño de cánula (#)" : "Tamaño de tubo (#)"}>
                        <Text v={f.oxTamano} on={(v) => set("oxTamano", v)} placeholder="p. ej. 7.5" />
                      </Field>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-stone-500">Antropometría para dosificación</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    ["IMC", r.imc ? r.imc.toFixed(1) : "—", "kg/m²"],
                    ["Peso ideal", r.ibw ? r.ibw.toFixed(1) : "—", "Devine · kg"],
                    ["Masa libre grasa", r.lbm ? r.lbm.toFixed(1) : "—", "FFM · Janmahasatian · kg"],
                    ["Peso ajustado", r.adjbw ? r.adjbw.toFixed(1) : "—", "AdjBW · kg"],
                  ].map(([k, v, u], i) => (
                    <div key={i} className="rounded-md bg-stone-50 p-2.5 text-center ring-1 ring-stone-200">
                      <p className="font-mono text-[17px] font-semibold tabular-nums leading-none text-stone-800">{v}</p>
                      <p className="mt-1 text-[11px] font-medium text-stone-600">{k}</p>
                      <p className="text-[9.5px] uppercase tracking-wide text-stone-400">{u}</p>
                    </div>
                  ))}
                </div>
                {f.sexo ? (
                  <p className="mt-1.5 text-[11px] text-stone-400">Requiere sexo, peso y talla. AdjBW = peso ideal + 0,4·(peso real − ideal); útil en obesidad.</p>
                ) : (
                  <p className="mt-1.5 text-[11px] font-medium text-amber-600">Seleccione el sexo en «Datos del paciente» para calcular peso ideal, masa magra y peso ajustado.</p>
                )}
              </div>
              <Field label="Soplo cardíaco" className="mt-3">
                <Seg value={f.soplo} on={(v) => set("soplo", v)}
                  options={[{ v: "ausente", label: "Ausente" }, { v: "sistolico", label: "Sistólico" }, { v: "diastolico", label: "Diastólico" }, { v: "continuo", label: "Continuo" }]} />
              </Field>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Cardiovascular"><Area v={f.exCardio} on={(v) => set("exCardio", v)} rows={2} placeholder="Ruidos, soplos, pulsos, edemas…" /></Field>
                <Field label="Respiratorio"><Area v={f.exResp} on={(v) => set("exResp", v)} rows={2} placeholder="Auscultación, trabajo respiratorio…" /></Field>
                <Field label="Abdominal"><Area v={f.exAbdomen} on={(v) => set("exAbdomen", v)} rows={2} placeholder="Blando, dolor, masas, organomegalias…" /></Field>
                <Field label="Neurológico"><Area v={f.exNeuro} on={(v) => set("exNeuro", v)} rows={2} placeholder="Estado mental, focalidad, déficit…" /></Field>
              </div>
            </Section>

            <Section icon={FlaskConical} title="Laboratorio y estudios">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Field label="Hb (g/dL)"><Text type="number" v={f.hb} on={(v) => set("hb", v)} /></Field>
                <Field label="Hematocrito (%)"><Text type="number" v={f.hematocrito} on={(v) => set("hematocrito", v)} /></Field>
                <Field label="Plaquetas (×10³)"><Text type="number" v={f.plaquetas} on={(v) => set("plaquetas", v)} /></Field>
                <Field label="INR"><Text type="number" v={f.inr} on={(v) => set("inr", v)} /></Field>
                <Field label="Creatinina (mg/dL)"><Text type="number" v={f.creatinina} on={(v) => setCrea(v)} /></Field>
                <Field label="Glucemia (mg/dL)"><Text type="number" v={f.glucemia} on={(v) => set("glucemia", v)} /></Field>
              </div>

              <div className="mt-3 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Función renal</p>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="w-full text-[12px] text-stone-600 sm:w-40">TFG · CKD-EPI 2021</span>
                    <span className="font-mono text-[16px] font-semibold tabular-nums text-stone-800">{r.egfr || "—"}</span>
                    {r.egfr ? <span className="text-[11px] text-stone-500">mL/min/1,73 m²</span> : null}
                    {r.egfr ? <span className={`rounded-md px-2 py-0.5 text-[11px] ring-1 ${LEVEL[r.egfrCat.level].chip}`}>{r.egfrCat.stage} · {r.egfrCat.label}</span> : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="w-full text-[12px] text-stone-600 sm:w-40">ClCr · Cockcroft-Gault</span>
                    <span className="font-mono text-[16px] font-semibold tabular-nums text-stone-800">{r.crcl || "—"}</span>
                    {r.crcl ? <span className="text-[11px] text-stone-500">mL/min</span> : null}
                  </div>
                </div>
                <div className="mt-2.5">
                  <span className="mb-1 block text-[10px] uppercase tracking-wide text-stone-400">Peso para Cockcroft-Gault</span>
                  <Seg value={f.cgPeso} on={(v) => set("cgPeso", v)}
                    options={[{ v: "real", label: "Real" }, { v: "ideal", label: "Ideal" }, { v: "ajustado", label: "Ajustado" }]} />
                </div>
                {!r.egfr && (
                  <p className="mt-2 text-[11px] font-medium text-amber-600">Para calcular la TFG introduzca creatinina (en Laboratorio) y edad y sexo (en «Datos del paciente»).</p>
                )}
                <p className="mt-2 text-[11px] text-stone-400">CKD-EPI normaliza a 1,73 m²; Cockcroft-Gault da aclaramiento absoluto (útil para dosificación). En obesidad valore peso ideal o ajustado.</p>
              </div>

              <div className="mt-4 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Pérdida sanguínea permisible (Gross)</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="Hb inicial (g/dL)">
                    <div className="flex h-[38px] items-center rounded-md bg-white px-3 ring-1 ring-stone-200 font-mono tabular-nums text-stone-700">{f.hb || "—"}</div>
                  </Field>
                  <Field label="Hb objetivo (g/dL)"><Text type="number" v={f.hbObjetivo} on={(v) => set("hbObjetivo", v)} /></Field>
                  <Field label="Volemia estimada">
                    <div className="flex h-[38px] items-center rounded-md bg-white px-3 ring-1 ring-stone-200 font-mono tabular-nums text-stone-700">{r.ebv ? Math.round(r.ebv) + " mL" : "—"}</div>
                  </Field>
                  <Field label="Pérdida permisible">
                    <div className={`flex h-[38px] items-center rounded-md px-3 font-mono tabular-nums ring-1 ${r.mabl ? "bg-teal-50 font-semibold text-teal-800 ring-teal-200" : "bg-white text-stone-400 ring-stone-200"}`}>{r.mabl ? Math.round(r.mabl) + " mL" : "—"}</div>
                  </Field>
                </div>
                <p className="mt-2 text-[11px] text-stone-400">
                  EBV = {f.sexo === "F" ? "65" : f.sexo === "M" ? "75" : "65–75"} mL/kg × peso · MABL = EBV·(Hb inicial − Hb objetivo) / Hb promedio. Requiere sexo, peso y Hb inicial &gt; objetivo.
                </p>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="ECG"><Text v={f.ecg} on={(v) => set("ecg", v)} placeholder="Normal / hallazgos" /></Field>
                <Field label="Rx tórax"><Text v={f.rxTorax} on={(v) => set("rxTorax", v)} /></Field>
                <Field label="Otros estudios"><Text v={f.otrosEstudios} on={(v) => set("otrosEstudios", v)} /></Field>
              </div>
            </Section>

            <Section icon={Wind} title="Riesgo pulmonar postoperatorio (ARISCAT)">
              <Check2 checked={f.ariscatInfeccion} on={() => toggle("ariscatInfeccion")} label="Infección respiratoria en el último mes" />
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Incisión quirúrgica">
                  <Seg value={f.ariscatIncision} on={(v) => set("ariscatIncision", v)}
                    options={[{ v: "periferica", label: "Periférica" }, { v: "abdominal_alta", label: "Abdominal alta" }, { v: "intratoracica", label: "Intratorácica" }]} />
                </Field>
                <Field label="Duración estimada">
                  <Seg value={f.ariscatDuracion} on={(v) => set("ariscatDuracion", v)}
                    options={[{ v: "lt2", label: "< 2 h" }, { v: "2-3", label: "2–3 h" }, { v: "gt3", label: "> 3 h" }]} />
                </Field>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.ariscat.parts.map(([k, v], i) => (
                  <span key={i} className={`rounded px-2 py-1 text-[11px] ring-1 ${v > 0 ? "bg-white text-stone-700 ring-stone-200" : "bg-stone-50 text-stone-400 ring-stone-200"}`}>{k}: {v}</span>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className={`rounded-md p-2.5 text-center ring-1 ${LEVEL[r.ariscat.level].chip}`}>
                  <p className="font-mono text-[18px] font-semibold tabular-nums leading-none">{r.ariscat.score}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-stone-500">Puntaje ARISCAT</p>
                </div>
                <div className="rounded-md bg-stone-50 p-2.5 text-center ring-1 ring-stone-200">
                  <p className="text-[13px] font-semibold text-stone-800">{r.ariscat.label}</p>
                  <p className="mt-0.5 text-[11px] text-stone-500">CPP estimadas {r.ariscat.pct}</p>
                </div>
              </div>
              <p className="mt-1.5 text-[11px] text-stone-400">Edad, SpO₂, anemia (Hb ≤ 10) y urgencia (cirugía urgente o emergente, según «Carácter») se toman automáticamente. Bajo &lt; 26 · intermedio 26–44 · alto ≥ 45.</p>
            </Section>

            <Section icon={ClipboardCheck} title="Clasificación ASA">
              <Seg value={f.asa} on={(v) => set("asa", v)}
                options={["1", "2", "3", "4", "5", "6"].map((n) => ({ v: n, label: ["I","II","III","IV","V","VI"][n - 1] }))} />
              <p className="mt-2 min-h-[18px] text-[12.5px] text-stone-600">{ASA_DESC[f.asa] || "Seleccione el estado físico ASA."}</p>
              <Check2 className="mt-2" checked={f.asaUrgencia} on={() => toggle("asaUrgencia")} label="Modificador “E” (urgencia / emergencia)" />
              <p className="mt-1.5 text-[11px] text-stone-400">Se marca automáticamente si «Carácter» es urgente/emergencia o el NCEPOD es inmediata/urgente; puede modificarlo manualmente.</p>
            </Section>

            <Section icon={FileText} title="Plan anestésico y conclusión">
              <Field label="Tipo de anestesia">
                <div className="flex flex-wrap gap-2">
                  {["General", "Regional", "Neuroaxial", "Sedación", "Combinada", "Local"].map((t) => (
                    <button key={t} onClick={() => toggleArr("tipoAnestesia", t)}
                      className={`rounded-full px-3 py-1.5 text-[13px] ring-1 transition ${
                        f.tipoAnestesia.includes(t)
                          ? "bg-teal-700 text-white ring-teal-700"
                          : "bg-white text-stone-600 ring-stone-200 hover:ring-stone-300"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="mt-3 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Recomendaciones de ayuno preoperatorio (consenso 2026)</p>
                <Check2 className="mt-2" checked={f.ayunoIncluir} on={() => toggle("ayunoIncluir")} label="Incluir recomendaciones de ayuno en el informe final" />
                {f.ayunoIncluir && (
                  <>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <Field label="Líquidos claros (h)"><Text type="number" v={f.ayunoClaros} on={(v) => set("ayunoClaros", v)} /></Field>
                      <Field label="Comida ligera (h)"><Text type="number" v={f.ayunoLigera} on={(v) => set("ayunoLigera", v)} /></Field>
                      <Field label="Comida copiosa (h)"><Text type="number" v={f.ayunoCopiosa} on={(v) => set("ayunoCopiosa", v)} /></Field>
                    </div>
                    <div className="mt-2 space-y-0.5 text-[11px] text-stone-400">
                      <p><span className="font-medium text-stone-500">Líquidos claros:</span> agua, té o café solos (con un chorrito de leche), zumo sin pulpa, bebidas isotónicas o de carbohidratos.</p>
                      <p><span className="font-medium text-stone-500">Comida ligera / líquidos no claros:</span> tostada o galletas, leche, fórmula, lácteos, zumo con pulpa.</p>
                      <p><span className="font-medium text-stone-500">Comida copiosa o grasa:</span> fritos, carne, comidas abundantes o ricas en grasa.</p>
                      <p>Ref. Rüggeberg et al., Anaesthesia 2026.</p>
                    </div>
                  </>
                )}
              </div>
              <Field label="Ayuno / indicaciones adicionales" className="mt-3"><Text v={f.ayuno} on={(v) => set("ayuno", v)} placeholder="indicaciones específicas adicionales" /></Field>
              <Field label="Manejo de medicación crónica perioperatoria" className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {MED_PERIOP.map((m) => (
                    <button key={m.id} onClick={() => toggleArr("medPeriop", m.id)}
                      className={`rounded-full px-3 py-1.5 text-[12.5px] ring-1 transition ${
                        f.medPeriop.includes(m.id) ? "bg-teal-700 text-white ring-teal-700" : "bg-white text-stone-600 ring-stone-200 hover:ring-stone-300"}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
                {f.medPeriop.length > 0 && (
                  <div className="mt-2 space-y-1 rounded-md bg-amber-50 p-2.5 ring-1 ring-amber-100">
                    {MED_PERIOP.filter((m) => f.medPeriop.includes(m.id)).map((m) => (
                      <p key={m.id} className="text-[11.5px] leading-snug text-stone-600"><span className="font-medium text-stone-700">{m.label}:</span> {m.nota}</p>
                    ))}
                  </div>
                )}
                <p className="mt-1.5 text-[11px] text-stone-400">Notas orientativas; la conducta final depende de la guía local, el riesgo de sangrado/trombosis y el tipo de cirugía. Para antitrombóticos use QxAApp.</p>
              </Field>
              <Field label="Plan de conciliación / manejo de medicación" className="mt-3"><Area v={f.medPeriopPlan} on={(v) => set("medPeriopPlan", v)} rows={2} placeholder="conducta por fármaco: continuar / suspender / ajustar…" /></Field>
              {f.anticoagulantes === "si" && (
                <Field label="Manejo perioperatorio de la anticoagulación/antiagregación" className="mt-3">
                  <Area v={f.anticoagPlanDetalle} on={(v) => set("anticoagPlanDetalle", v)} rows={2} placeholder="Conducta: continúa / ajusta / suspende; qué fármaco, cuándo suspender, puente con HBPM, reinicio postoperatorio…" />
                </Field>
              )}
              <Field label="Consideraciones especiales" className="mt-3"><Area v={f.consideraciones} on={(v) => set("consideraciones", v)} rows={2} /></Field>
              <Field label="Conclusión / aptitud" className="mt-3">
                <Seg value={f.conclusion} on={(v) => set("conclusion", v)} stack
                  options={[
                    { v: "apto", label: "Apto para procedimiento" },
                    { v: "condiciones", label: "Apto con condiciones" },
                    { v: "optimizar", label: "Requiere optimización / estudios" },
                    { v: "diferir", label: "Diferir procedimiento" },
                  ]} />
              </Field>
              <Field label="Recomendaciones" className="mt-3"><Area v={f.recomendaciones} on={(v) => set("recomendaciones", v)} rows={2} /></Field>
            </Section>

            <Section icon={FlaskConical} title="Estudios complementarios solicitados">
              <Field label="¿Solicita estudios complementarios?">
                <Seg value={f.solicitaEstudios} on={(v) => set("solicitaEstudios", v)}
                  options={[{ v: "no", label: "No" }, { v: "si", label: "Sí" }]} />
              </Field>
              {f.solicitaEstudios === "si" && (
                <>
                  <p className="mt-3 mb-2 text-[11px] text-stone-400">Para pacientes seleccionados según hallazgos clínicos y riesgo.</p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMENES_ADIC.map((s) => (
                      <button key={s} onClick={() => toggleArr("examenesAdic", s)}
                        className={`rounded-full px-3 py-1.5 text-[12.5px] ring-1 transition ${
                          f.examenesAdic.includes(s) ? "bg-teal-700 text-white ring-teal-700" : "bg-white text-stone-600 ring-stone-200 hover:ring-stone-300"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <Field label="Otros estudios" className="mt-3"><Text v={f.examenesAdicOtros} on={(v) => set("examenesAdicOtros", v)} placeholder="otros estudios solicitados…" /></Field>
                </>
              )}
            </Section>

            <Section icon={Bed} title="Reservas y disposición postoperatoria">
              <Field label="Reserva de cama postoperatoria">
                <Seg value={f.reservaCama} on={(v) => set("reservaCama", v)}
                  options={[
                    { v: "ninguna", label: "Ninguna" },
                    { v: "intermedio", label: "Cuidado intermedio" },
                    { v: "uci", label: "UCI" },
                  ]} />
              </Field>
              <Check2 className="mt-3" checked={f.reservaHemo} on={() => toggle("reservaHemo")} label="Reservar hemoderivados" />
              {f.reservaHemo && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="Glóbulos rojos (uds)"><Text type="number" v={f.hemoCGR} on={(v) => set("hemoCGR", v)} /></Field>
                  <Field label="Plasma fresco (uds)"><Text type="number" v={f.hemoPFC} on={(v) => set("hemoPFC", v)} /></Field>
                  <Field label="Plaquetas (uds)"><Text type="number" v={f.hemoPlaq} on={(v) => set("hemoPlaq", v)} /></Field>
                  <Field label="Crioprecipitado (uds)"><Text type="number" v={f.hemoCrio} on={(v) => set("hemoCrio", v)} /></Field>
                </div>
              )}
              <Field label="Observaciones de reservas" className="mt-3">
                <Text v={f.reservaObs} on={(v) => set("reservaObs", v)} placeholder="p.ej. pruebas cruzadas, disponibilidad, banco de sangre…" />
              </Field>
            </Section>

            <Section icon={User} title="Valoración realizada por">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Nombre del evaluador"><Text v={f.evaluador} on={(v) => set("evaluador", v)} placeholder="Dr(a). …" /></Field>
                <Field label="Registro / matrícula"><Text v={f.evaluadorRegistro} on={(v) => set("evaluadorRegistro", v)} /></Field>
              </div>
              <Field label="Fecha y hora de la valoración" className="mt-3">
                <div className="flex items-center gap-2">
                  <input type="datetime-local" value={f.fechaValoracion} onChange={(e) => set("fechaValoracion", e.target.value)} className={inputCls} />
                  <button onClick={() => { const d = new Date(); const p = (n) => String(n).padStart(2, "0"); set("fechaValoracion", `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`); }}
                    className="shrink-0 rounded-md bg-stone-100 px-3 py-2 text-[13px] font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-200">Ahora</button>
                </div>
              </Field>
            </Section>

            <p className="px-1 text-[11.5px] leading-relaxed text-stone-400">
              Herramienta de apoyo a la decisión. Las escalas son orientativas y no sustituyen la valoración ni el
              juicio clínico del anestesiólogo responsable.
            </p>
          </div>

          {/* ── Panel de riesgo (sticky) ── */}
          <aside className="lg:sticky lg:top-4 lg:self-start space-y-3">
            <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold uppercase tracking-wide text-stone-500">Resumen de riesgo</h2>
                <Activity size={15} className="text-teal-700" />
              </div>

              <div className="space-y-2.5">
                <ScoreRow label="IMC" value={r.imc ? r.imc.toFixed(1) : "—"} note={r.imcCat.label} level={r.imcCat.level} />
                <ScoreRow label="ASA" value={f.asa ? toRoman(f.asa) + (f.asaUrgencia ? "E" : "") : "—"} note={ASA_SHORT[f.asa] || "Sin clasificar"} level={r.asaLevel} />
                <ScoreRow label="RCRI (Lee)" value={r.rcri.n} note={r.rcri.label} level={r.rcri.level} />
                <ScoreRow label="Riesgo cardíaco (ESC)" value={r.cardRisk.short} note={r.cardRisk.level === "none" ? "Procedimiento sin seleccionar" : `ESC 2022 · ${r.cardRisk.label}`} level={r.cardRisk.level} />
                <ScoreRow label="Capacidad funcional" value={r.func.value} note={r.func.note} level={r.func.level} />
                <ScoreRow label="Vía aérea" value={r.vad.n} note={r.vad.label} level={r.vad.level} />
                <ScoreRow label="STOP-BANG" value={r.stop.n + "/8"} note={r.stop.label} level={r.stop.level} />
                <ScoreRow label="ARISCAT" value={r.ariscat.score} note={`${r.ariscat.label} · CPP ${r.ariscat.pct}`} level={r.ariscat.level} />
                <ScoreRow label="Apfel (NVPO)" value={r.apfel.n + "/4"} note={r.apfel.label} level={r.apfel.level} />
                <ScoreRow label="Charlson" value={r.charlson.total} note={r.charlson.label} level={r.charlson.level} />
                {r.childPugh && <ScoreRow label="Child-Pugh" value={`${r.childPugh.score} · ${r.childPugh.clase}`} note={`Clase ${r.childPugh.clase}`} level={r.childPugh.level} />}
                {r.frail && <ScoreRow label="Fragilidad (CFS)" value={`CFS ${r.frail.n}`} note={r.frail.label} level={r.frail.level} />}
              </div>
            </div>

            {r.alerts.length > 0 && (
              <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
                <div className="mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-600" />
                  <h2 className="text-[13px] font-semibold uppercase tracking-wide text-stone-500">Alertas</h2>
                </div>
                <ul className="space-y-1.5">
                  {r.alerts.map((a, i) => (
                    <li key={i} className="flex gap-2 text-[12.5px] leading-snug text-stone-600">
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${LEVEL[a.level].dot}`} />
                      {a.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button onClick={() => setView("report")}
              className="no-print w-full rounded-lg bg-teal-800 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900">
              Generar informe
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ── Vista de informe ── */
function Report({ f, r, onBack, onCopy, copied, onCopyHC, copiedHC }) {
  const hc = buildHC(f, r);
  return (
    <div className="min-h-screen bg-stone-100 py-6 print:bg-white">
      <style>{`@media print { .no-print { display:none !important; } body { background:#fff; } }`}</style>
      <div className="mx-auto max-w-3xl px-5">
        <div className="no-print mb-4 flex items-center gap-2">
          <button onClick={onBack} className="rounded-md bg-white px-3 py-2 text-[13px] font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50">← Volver</button>
          <div className="flex-1" />
          <button onClick={onCopy} className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-[13px] font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50">
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />} {copied ? "Copiado" : "Copiar"}
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-md bg-teal-800 px-3 py-2 text-[13px] font-medium text-white hover:bg-teal-900">
            <Printer size={14} /> Imprimir
          </button>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-stone-200 print:shadow-none print:ring-0">
          <div className="mb-5 flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-stone-900">Informe de valoración preanestésica</h1>
              <p className="text-[12px] text-stone-400">{f.fecha || new Date().toLocaleDateString("es-CO")}</p>
            </div>
            <Stethoscope size={26} className="text-teal-800" />
          </div>

          <RGroup title="Paciente">
            <RItem k="Nombre" v={f.nombre} /><RItem k="Documento" v={f.documento} />
            <RItem k="Edad" v={f.edad && `${f.edad} años`} /><RItem k="Sexo" v={f.sexo === "M" ? "Masculino" : f.sexo === "F" ? "Femenino" : ""} />
            <RItem k="Fecha de nacimiento" v={f.fechaNacimiento} />
            <RItem k="Estado gestacional" v={f.sexo === "F" && f.gestacion !== "no" ? `${f.gestacion === "si" ? "Gestante" : "Posible embarazo"}${f.gestacion === "si" && f.semanasGestacion ? ` · ${f.semanasGestacion} sem` : ""}${f.fum ? ` · FUM ${f.fum}` : ""}` : ""} full />
          </RGroup>

          <RGroup title="Procedimiento">
            <RItem k="Cirugía" v={f.cirugia} />
            <RItem k="Carácter" v={cap(f.caracter)} />
            <RItem k="Lateralidad" v={f.lateralidad !== "na" ? LAT[f.lateralidad] : ""} />
            <RItem k="Urgencia NCEPOD" v={ncepodStr(f)} />
            <RItem k="Procedimiento (ESC)" v={f.procedimientoEsc} full />
            <RItem k="Riesgo cardíaco (ESC 2022)" v={r.cardRisk.level !== "none" ? r.cardRisk.label : ""} />
            <RItem k="Alto riesgo Qx" v={f.altoRiesgoQx ? "Sí" : ""} />
          </RGroup>

          <RGroup title="Antecedentes">
            <RItem k="Patológicos" v={antFull(f, r).join("; ") || "Niega"} full />
            <RItem k="Otros" v={f.antecedentesOtros} full />
            <RItem k="Quirúrgicos" v={f.cirugiasPrevias} full />
            <RItem k="Anestésicos" v={anestesicoStr(f)} full />
            <RItem k="Transfusión" v={f.transfusion === "si" ? `Sí${f.transfusionDetalle ? ` · ${f.transfusionDetalle}` : ""}` : f.transfusion === "rechaza" ? "Rechaza hemoderivados" : f.transfusion === "no" ? "No" : ""} full />
          </RGroup>

          <RGroup title="Medicación y alergias">
            <RItem k="Medicación" v={f.tomaMedicacion === "no" ? "Niega" : f.tomaMedicacion === "si" ? (f.medicacion || "Sí") : f.medicacion} full />
            <RItem k="Anticoagulación / antiagregación" v={anticoagStr(f)} full />
            <RItem k="Alergias" v={f.tieneAlergias === "no" ? "Niega" : f.tieneAlergias === "si" ? (f.alergias || "Sí") : f.alergias} full />
          </RGroup>

          <RGroup title="Hábitos y capacidad funcional">
            <RItem k="Tabaco" v={f.tabaco === "ex" ? `Ex-fumador${f.tabacoSusp ? ` (suspendió hace ${f.tabacoSusp === "lt1" ? "< 1 año" : "≥ 1 año"})` : ""}` : { no: "Nunca", activo: "Activo" }[f.tabaco]} />
            <RItem k="IPA" v={r.ipa ? `${r.ipa.toFixed(1)} paquetes-año` : ""} />
            <RItem k="Alcohol" v={{ no: "No", social: "Social", abuso: "Abuso" }[f.alcohol]} />
            <RItem k="Capacidad funcional" v={r.func.text} />
            <RItem k="Estado funcional (NSQIP)" v={NSQIP_FUNC[f.estadoFuncional]} />
            <RItem k="Sustancias psicoactivas" v={f.drogas ? ["Sí", f.sustanciasDetalle].filter(Boolean).join(" — ") : ""} full />
          </RGroup>

          <RGroup title="Revisión por sistemas">
            <RItem k="Dolor torácico" v={`${DOLOR_TOR[f.dolorToracico]}${f.dolorToracico === "anginoso" && f.anginaCCS ? ` · angina CCS ${toRoman(f.anginaCCS)}` : ""}`} />
            <RItem k="Síntomas respiratorios" v={f.sintResp.join(", ")} full />
            <RItem k="Síntomas de falla cardíaca" v={f.sintFalla.join(", ")} full />
            <RItem k="Otros síntomas / observaciones" v={f.rosObs} full />
          </RGroup>

          <RGroup title="Vía aérea">
            <RItem k="Mallampati" v={f.mallampati && toRoman(f.mallampati)} />
            <RItem k="Test de mordida (ULBT)" v={f.mordida && `Clase ${toRoman(f.mordida)}`} />
            <RItem k="Apertura oral" v={f.aperturaOral === "lt3" ? "< 3 cm" : "≥ 3 cm"} />
            <RItem k="Dist. tiromentoniana" v={f.distTiro === "lt6" ? "< 6 cm" : "≥ 6 cm"} />
            <RItem k="Movilidad cervical" v={cap(f.movilidadCervical)} />
            <RItem k="Dentadura" v={cap(f.dentadura)} />
            <RItem k="Observaciones vía aérea" v={f.viaAereaObs} full />
            <RItem k="Riesgo de aspiración" v={f.aspiracion === "aumentado" ? `Aumentado${f.aspiracionFactores.length ? ` (${f.aspiracionFactores.join(", ")})` : ""}` : "Bajo"} full />
          </RGroup>

          <RGroup title="Examen físico">
            <RItem k="Peso / Talla" v={[f.peso && `${f.peso} kg`, f.talla && `${f.talla} cm`].filter(Boolean).join(" · ")} />
            <RItem k="C. cuello" v={f.cuello && `${f.cuello} cm`} />
            <RItem k="IMC" v={r.imc ? `${r.imc.toFixed(1)} (${r.imcCat.label})` : ""} />
            <RItem k="Peso ideal (Devine)" v={r.ibw ? `${r.ibw.toFixed(1)} kg` : ""} />
            <RItem k="Masa libre de grasa (FFM)" v={r.lbm ? `${r.lbm.toFixed(1)} kg` : ""} />
            <RItem k="Peso ajustado (AdjBW)" v={r.adjbw ? `${r.adjbw.toFixed(1)} kg` : ""} />
            <RItem k="TA / FC / SpO₂" v={[f.ta, f.fc && `${f.fc} lpm`, f.spo2 && `${f.spo2}%`].filter(Boolean).join(" · ")} />
            <RItem k="Oxígeno / vía aérea" v={oxLine(f)} full />
            <RItem k="Soplo cardíaco" v={SOPLO[f.soplo]} />
            <RItem k="Cardiovascular" v={f.exCardio} full />
            <RItem k="Respiratorio" v={f.exResp} full />
            <RItem k="Abdominal" v={f.exAbdomen} full />
            <RItem k="Neurológico" v={f.exNeuro} full />
          </RGroup>

          <RGroup title="Laboratorio y estudios">
            <RItem k="Hb" v={f.hb && `${f.hb} g/dL`} /><RItem k="Hto" v={f.hematocrito && `${f.hematocrito}%`} />
            <RItem k="Plaquetas" v={f.plaquetas && `${plaqTotal(f)}/µL`} />
            <RItem k="INR" v={f.inr} /><RItem k="Creatinina" v={f.creatinina && `${f.creatinina} mg/dL`} />
            <RItem k="TFG (CKD-EPI 2021)" v={r.egfr ? `${r.egfr} mL/min/1,73m² · ${r.egfrCat.stage}` : ""} />
            <RItem k="ClCr (Cockcroft-Gault)" v={r.crcl ? `${r.crcl} mL/min · ${{ real: "peso real", ideal: "peso ideal", ajustado: "peso ajustado" }[f.cgPeso]}` : ""} />
            <RItem k="Glucemia" v={f.glucemia && `${f.glucemia} mg/dL`} />
            <RItem k="ECG" v={f.ecg} /><RItem k="Rx tórax" v={f.rxTorax} /><RItem k="Otros" v={f.otrosEstudios} />
            <RItem k="Volemia estimada" v={r.ebv ? `${Math.round(r.ebv)} mL` : ""} />
            <RItem k="Pérdida permisible (Gross)" v={r.mabl ? `${Math.round(r.mabl)} mL · Hb objetivo ${f.hbObjetivo} g/dL` : ""} full />
          </RGroup>

          <div className="my-5 rounded-lg bg-stone-50 p-4 ring-1 ring-stone-200">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Escalas de riesgo</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
              <RScore k="ASA" v={f.asa ? toRoman(f.asa) + (f.asaUrgencia ? "E" : "") : "—"} />
              <RScore k="Vía aérea difícil" v={`${r.vad.n} predictores`} />
              <RScore k="STOP-BANG" v={`${r.stop.n}/8 · ${r.stop.label}`} />
              <RScore k="RCRI (Lee)" v={`${r.rcri.n} · ${r.rcri.label}`} />
              <RScore k="Apfel (NVPO)" v={`${r.apfel.n}/4 · ${r.apfel.pct}`} />
              <RScore k="ARISCAT (pulmonar)" v={`${r.ariscat.score} · ${r.ariscat.label} · CPP ${r.ariscat.pct}`} />
              <RScore k="Charlson (edad-aj.)" v={`${r.charlson.total} · superv. 10a ~${r.charlson.surv}%`} />
              {r.frail && <RScore k="Fragilidad CFS" v={`${r.frail.n} · ${r.frail.label}${r.frail.frail ? " · fragilidad" : ""}`} />}
              <RScore k="IMC" v={r.imc ? r.imc.toFixed(1) : "—"} />
            </div>
          </div>

          <RGroup title="Plan anestésico">
            <RItem k="Tipo de anestesia" v={anestStr(f)} full />
          </RGroup>

          {f.ayunoIncluir && (
            <div className="mb-4">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-teal-800">Recomendaciones de ayuno preoperatorio</p>
              <ul className="space-y-0.5 text-[13px] text-stone-800">
                <li>Líquidos claros (agua, té o café solos, zumo sin pulpa, bebidas isotónicas): hasta {f.ayunoClaros} h antes.</li>
                <li>Comida ligera / líquidos no claros (tostada, leche, lácteos, zumo con pulpa): {f.ayunoLigera} h antes.</li>
                <li>Comida copiosa o grasa (fritos, carne, comidas abundantes): {f.ayunoCopiosa} h antes.</li>
              </ul>
            </div>
          )}

          <div className="mb-4 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
            <RItem k="Ayuno / indicaciones adicionales" v={f.ayuno} full />
            <RItem k="Consideraciones" v={f.consideraciones} full />
          </div>
          {(f.medPeriop.length > 0 || f.medPeriopPlan) && (
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Manejo de medicación crónica perioperatoria</p>
              {f.medPeriop.length > 0 && (
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[12.5px] text-stone-700">
                  {MED_PERIOP.filter((m) => f.medPeriop.includes(m.id)).map((m) => (
                    <li key={m.id}><span className="font-medium">{m.label}:</span> {m.nota}</li>
                  ))}
                </ul>
              )}
              {f.medPeriopPlan && <p className="mt-1.5 text-[13px] text-stone-700">{f.medPeriopPlan}</p>}
            </div>
          )}

          <RGroup title="Reservas y disposición postoperatoria">
            <RItem k="Cama postoperatoria" v={{ ninguna: "Hospitalización en sala", intermedio: "Cuidado intermedio", uci: "UCI" }[f.reservaCama]} />
            <RItem k="Hemoderivados" v={f.reservaHemo ? hemoStr(f) : ""} full />
            <RItem k="Estudios complementarios solicitados" v={f.solicitaEstudios === "si" ? [f.examenesAdic.join(", "), f.examenesAdicOtros].filter(Boolean).join(", ") : ""} full />
            <RItem k="Observaciones" v={f.reservaObs} full />
          </RGroup>

          <div className="mt-5 border-t border-stone-200 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Conclusión</p>
            <p className="mt-1 text-[15px] font-semibold text-teal-900">{CONCL[f.conclusion] || "Sin definir"}</p>
            {f.recomendaciones && <p className="mt-2 text-[13.5px] leading-relaxed text-stone-700">{f.recomendaciones}</p>}
          </div>

          {(f.evaluador || f.fechaValoracion) && (
            <div className="mt-5 border-t border-stone-200 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Valoración realizada por</p>
              <p className="mt-1 text-[13.5px] text-stone-700">
                {f.evaluador || "—"}{f.evaluadorRegistro ? ` · Reg. ${f.evaluadorRegistro}` : ""}
                {f.fechaValoracion ? ` · ${fmtDateTime(f.fechaValoracion)}` : ""}
              </p>
            </div>
          )}

          <p className="mt-6 text-[10.5px] leading-relaxed text-stone-400">
            Documento de apoyo generado a partir de los datos ingresados. Las escalas son orientativas y no sustituyen
            el juicio clínico del anestesiólogo responsable.
          </p>
        </div>

        <div className="no-print mt-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-[14px] font-semibold tracking-tight text-stone-900">Historia clínica — texto plano (mayúsculas)</h2>
            </div>
            <button onClick={onCopyHC} className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-teal-800 px-3 py-2 text-[13px] font-medium text-white hover:bg-teal-900">
              {copiedHC ? <Check size={14} /> : <Copy size={14} />} {copiedHC ? "Copiado" : "Copiar"}
            </button>
          </div>
          <pre className="max-h-[28rem] overflow-auto rounded-md bg-stone-50 p-3 text-[11.5px] leading-relaxed text-stone-700 ring-1 ring-stone-200" style={{ whiteSpace: "pre-wrap", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{hc}</pre>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────── Cálculos ──────────────────────────────── */
function compute(f) {
  const edad = num(f.edad), peso = num(f.peso), tallaCm = num(f.talla);
  const cfsN = parseInt(f.cfs) || 0;
  const frail = edad >= 65 && cfsN
    ? { n: cfsN, label: CFS_LEVELS.find((c) => c.n === cfsN).label, level: cfsN >= 7 ? "high" : cfsN >= 5 ? "mod" : "low", frail: cfsN >= 5 }
    : null;
  let childPugh = null;
  if (f.hepatopatia) {
    const cp = (parseInt(f.cpBili) || 1) + (parseInt(f.cpAlb) || 1) + (parseInt(f.cpInr) || 1) + (parseInt(f.cpAscitis) || 1) + (parseInt(f.cpEncef) || 1);
    childPugh = { score: cp, clase: cp <= 6 ? "A" : cp <= 9 ? "B" : "C", level: cp <= 6 ? "low" : cp <= 9 ? "mod" : "high" };
  }
  const tallaM = tallaCm / 100;
  const imc = peso > 0 && tallaM > 0 ? peso / (tallaM * tallaM) : 0;

  const imcCat = !imc ? { label: "—", level: "none" }
    : imc < 18.5 ? { label: "Bajo peso", level: "mod" }
    : imc < 25 ? { label: "Normal", level: "low" }
    : imc < 30 ? { label: "Sobrepeso", level: "mod" }
    : imc < 35 ? { label: "Obesidad I", level: "mod" }
    : imc < 40 ? { label: "Obesidad II", level: "high" }
    : { label: "Obesidad III", level: "high" };

  // Pesos para dosificación
  const sexM = f.sexo === "M", sexF = f.sexo === "F";
  let ibw = 0;
  if (tallaCm > 0 && (sexM || sexF)) {
    ibw = (sexM ? 50 : 45.5) + 2.3 * (tallaCm / 2.54 - 60);
    if (ibw < 0) ibw = 0;
  }
  let lbm = 0;
  if (peso > 0 && imc > 0 && (sexM || sexF)) {
    // Masa libre de grasa (FFM) — Janmahasatian et al., Clin Pharmacokinet 2005
    lbm = sexM ? (9270 * peso) / (6680 + 216 * imc) : (9270 * peso) / (8780 + 244 * imc);
  }
  const adjbw = ibw > 0 && peso > 0 ? ibw + 0.4 * (peso - ibw) : 0;

  // Volemia estimada y pérdida sanguínea permisible (Gross)
  const ebvCoef = sexM ? 75 : sexF ? 65 : 0;
  const ebv = ebvCoef > 0 && peso > 0 ? ebvCoef * peso : 0;
  const hbIni = num(f.hb), hbObj = num(f.hbObjetivo);
  const mabl = ebv > 0 && hbIni > 0 && hbObj > 0 && hbIni > hbObj
    ? (ebv * (hbIni - hbObj)) / ((hbIni + hbObj) / 2)
    : 0;

  // TFG estimada — CKD-EPI 2021 (sin variable de raza)
  const scr = num(f.creatinina);
  let egfr = 0;
  if (scr > 0 && edad > 0 && (sexM || sexF)) {
    const kappa = sexF ? 0.7 : 0.9;
    const alpha = sexF ? -0.241 : -0.302;
    const ratio = scr / kappa;
    egfr = Math.round(
      142 *
      Math.pow(Math.min(ratio, 1), alpha) *
      Math.pow(Math.max(ratio, 1), -1.2) *
      Math.pow(0.9938, edad) *
      (sexF ? 1.012 : 1)
    );
  }
  const egfrCat = !egfr ? { stage: "", label: "—", level: "none" }
    : egfr >= 90 ? { stage: "G1", label: "Normal o alta", level: "low" }
    : egfr >= 60 ? { stage: "G2", label: "Levemente disminuida", level: "low" }
    : egfr >= 45 ? { stage: "G3a", label: "Disminución leve-moderada", level: "mod" }
    : egfr >= 30 ? { stage: "G3b", label: "Disminución moderada-grave", level: "mod" }
    : egfr >= 15 ? { stage: "G4", label: "Disminución grave", level: "high" }
    : { stage: "G5", label: "Fallo renal", level: "high" };

  // Aclaramiento de creatinina — Cockcroft-Gault
  const cgWeight = f.cgPeso === "ideal" ? ibw : f.cgPeso === "ajustado" ? adjbw : peso;
  let crcl = 0;
  if (scr > 0 && edad > 0 && cgWeight > 0 && (sexM || sexF)) {
    crcl = Math.round(((140 - edad) * cgWeight * (sexF ? 0.85 : 1)) / (72 * scr));
    if (crcl < 0) crcl = 0;
  }

  // Vía aérea difícil — predictores
  const vadFactors = [
    f.mallampati === "3" || f.mallampati === "4",
    f.mordida === "3",
    f.aperturaOral === "lt3",
    f.distTiro === "lt6",
    f.movilidadCervical === "limitada",
    f.vadPrevia,
    f.dentadura === "edentulo",
    imc >= 35,
  ].filter(Boolean).length;
  const vad = {
    n: vadFactors,
    level: vadFactors >= 2 ? "high" : vadFactors === 1 ? "mod" : imc || f.mallampati ? "low" : "none",
    label: vadFactors >= 2 ? "Predictores presentes" : vadFactors === 1 ? "1 predictor" : "Sin predictores",
  };

  // STOP-BANG
  const stopN = [
    f.ronquido, f.cansancio, f.apneas, f.hta,
    imc > 35, edad > 50, num(f.cuello) >= 40, f.sexo === "M",
  ].filter(Boolean).length;
  const stop = {
    n: stopN,
    level: stopN >= 5 ? "high" : stopN >= 3 ? "mod" : "low",
    label: stopN >= 5 ? "Riesgo alto" : stopN >= 3 ? "Riesgo intermedio" : "Riesgo bajo",
  };

  // RCRI (Lee)
  const rcriN = [
    f.altoRiesgoQx, f.cardiopatiaIsq, f.icc, f.ecv, f.diabetes && f.diabetesInsulina, num(f.creatinina) > 2,
  ].filter(Boolean).length;
  const rcri = {
    n: rcriN,
    level: rcriN >= 2 ? "high" : rcriN === 1 ? "mod" : "low",
    label: rcriN >= 3 ? "Clase IV (~11%)" : rcriN === 2 ? "Clase III (~7%)" : rcriN === 1 ? "Clase II (~1%)" : "Clase I (~0.4%)",
  };

  // Apfel (NVPO)
  const apfelN = [
    f.sexo === "F", f.tabaco === "no", f.nvpoPrevia, f.opioidesPostop,
  ].filter(Boolean).length;
  const apfelPct = ["~10%", "~21%", "~39%", "~61%", "~79%"][apfelN];
  const apfel = {
    n: apfelN, pct: apfelPct,
    level: apfelN >= 3 ? "high" : apfelN === 2 ? "mod" : "low",
    label: apfelN >= 3 ? "Riesgo alto " + apfelPct : apfelN === 2 ? "Riesgo moderado " + apfelPct : "Riesgo bajo " + apfelPct,
  };

  const asaN = parseInt(f.asa) || 0;
  const asaLevel = !asaN ? "none" : asaN <= 2 ? "low" : asaN === 3 ? "mod" : "high";

  // Índice de Charlson
  const chAge = edad < 50 ? 0 : edad < 60 ? 1 : edad < 70 ? 2 : edad < 80 ? 3 : edad < 90 ? 4 : 5;
  const chDiab = f.ch_diabetes === "organo" ? 2 : f.ch_diabetes === "simple" ? 1 : 0;
  const chHep = f.ch_hepatopatia === "grave" ? 3 : f.ch_hepatopatia === "leve" ? 1 : 0;
  const chTum = f.ch_tumor === "meta" ? 6 : f.ch_tumor === "local" ? 2 : 0;
  const chComorb =
    (f.ch_mi ? 1 : 0) + (f.ch_icc ? 1 : 0) + (f.ch_evp ? 1 : 0) + (f.ch_ecv ? 1 : 0) +
    (f.ch_demencia ? 1 : 0) + (f.ch_epoc ? 1 : 0) + (f.ch_conectivo ? 1 : 0) + (f.ch_ulcera ? 1 : 0) +
    (f.ch_hemiplejia ? 2 : 0) + (f.ch_renal ? 2 : 0) + (f.ch_leucemia ? 2 : 0) + (f.ch_linfoma ? 2 : 0) +
    (f.ch_sida ? 6 : 0) + chDiab + chHep + chTum;
  const chTotal = chComorb + chAge;
  const chSurv = Math.round(Math.pow(0.983, Math.exp(chTotal * 0.9)) * 100);
  const charlson = {
    comorb: chComorb, age: chAge, total: chTotal, surv: chSurv,
    level: chTotal === 0 ? "low" : chTotal <= 2 ? "mod" : "high",
    label: `Edad-aj. · superv. ~${chSurv}%`,
  };

  // Capacidad funcional — DASI (Duke Activity Status Index)
  const dasiScore = DASI_ITEMS.reduce((s, it, i) => s + (f.dasi && f.dasi[i] ? it.w : 0), 0);
  const dasiVO2 = 0.43 * dasiScore + 9.6;
  const dasiMets = dasiVO2 / 3.5;
  const dasiLevel = dasiScore === 0 ? "none" : dasiScore < 34 ? "mod" : "low";
  const dasi = { score: dasiScore, vo2: dasiVO2, mets: dasiMets, level: dasiLevel };
  const metCatItem = MET_CAT.find((o) => o.v === f.metCat);
  const ipa = num(f.cigarrillosDia) > 0 && num(f.aniosFuma) > 0 ? (num(f.cigarrillosDia) / 20) * num(f.aniosFuma) : 0;
  const procEscRisk = f.procedimientoEsc ? Object.keys(PROC_ESC).find((k) => PROC_ESC[k].includes(f.procedimientoEsc)) || "" : "";
  const cardRisk = procEscRisk ? PROC_ESC_RISK[procEscRisk] : { label: "—", short: "—", level: "none" };
  const funcLow =
    f.capMetodo === "dasi" ? (dasiScore > 0 && dasiScore < 34)
    : f.capMetodo === "valad" ? (metCatItem ? metCatItem.level !== "low" : false)
    : f.mets === "lt4";
  let func;
  if (f.capMetodo === "dasi") {
    func = {
      value: dasiScore ? dasiScore.toFixed(0) : "—",
      note: dasiScore ? `DASI · ~${dasiMets.toFixed(1)} METs` : "DASI sin completar",
      level: dasiLevel,
      text: dasiScore ? `DASI ${dasiScore.toFixed(2)} · ~${dasiMets.toFixed(1)} METs${dasiScore < 34 ? " (< 34)" : ""}` : "DASI sin completar",
    };
  } else if (f.capMetodo === "valad") {
    func = {
      value: metCatItem ? metCatItem.met : "—",
      note: metCatItem ? "METs (categórica)" : "Sin seleccionar",
      level: metCatItem ? metCatItem.level : "none",
      text: metCatItem ? `${metCatItem.met} METs` : "Sin seleccionar",
    };
  } else {
    func = {
      value: { lt4: "< 4", ge4: "≥ 4", desc: "—" }[f.mets] || "—",
      note: f.mets === "desc" ? "METs desconocidos" : "METs",
      level: f.mets === "lt4" ? "mod" : f.mets === "ge4" ? "low" : "none",
      text: { lt4: "< 4 METs", ge4: "≥ 4 METs", desc: "Desconocida" }[f.mets] || "—",
    };
  }

  // ARISCAT — riesgo de complicaciones pulmonares postoperatorias
  const arEdad = edad === 0 ? 0 : edad <= 50 ? 0 : edad <= 80 ? 3 : 16;
  const spo2v = num(f.spo2);
  const arSpo2 = spo2v === 0 ? 0 : spo2v >= 96 ? 0 : spo2v >= 91 ? 8 : 24;
  const hbv = num(f.hb);
  const arAnemia = hbv > 0 && hbv <= 10 ? 11 : 0;
  const arInfeccion = f.ariscatInfeccion ? 17 : 0;
  const arIncision = f.ariscatIncision === "intratoracica" ? 24 : f.ariscatIncision === "abdominal_alta" ? 15 : 0;
  const arDuracion = f.ariscatDuracion === "gt3" ? 23 : f.ariscatDuracion === "2-3" ? 16 : 0;
  const arEmergencia = f.caracter === "emergencia" || f.caracter === "urgente" ? 8 : 0;
  const ariscatScore = arEdad + arSpo2 + arAnemia + arInfeccion + arIncision + arDuracion + arEmergencia;
  const ariscat = {
    score: ariscatScore,
    level: ariscatScore >= 45 ? "high" : ariscatScore >= 26 ? "mod" : "low",
    pct: ariscatScore >= 45 ? "~42%" : ariscatScore >= 26 ? "~13%" : "~1,6%",
    label: ariscatScore >= 45 ? "Riesgo alto" : ariscatScore >= 26 ? "Riesgo intermedio" : "Riesgo bajo",
    parts: [
      ["Edad", arEdad], ["SpO₂", arSpo2], ["Anemia", arAnemia], ["Infección resp.", arInfeccion],
      ["Incisión", arIncision], ["Duración", arDuracion], ["Urgencia", arEmergencia],
    ],
  };

  // Alertas contextuales
  const alerts = [];
  if (vad.n >= 2) alerts.push({ level: "high", text: "Predictores de vía aérea difícil: prepare plan y dispositivos de rescate." });
  if (rcri.level === "high") alerts.push({ level: "high", text: "Riesgo cardíaco perioperatorio elevado: valore optimización / interconsulta." });
  if (cardRisk.level === "high") alerts.push({ level: "mod", text: "Procedimiento de alto riesgo cardíaco (ESC 2022, > 5%)." });
  if (f.icc && (f.iccNyha === "3" || f.iccNyha === "4")) alerts.push({ level: "high", text: "Insuficiencia cardíaca NYHA III–IV: alto riesgo perioperatorio; valore optimización." });
  if (f.epoc && f.epocO2) alerts.push({ level: "mod", text: "EPOC con O₂ domiciliario: optimización respiratoria y riesgo pulmonar." });
  if (f.asma && f.asmaExacerbacion === "lt4") alerts.push({ level: "mod", text: "Asma con exacerbación reciente (< 4 semanas): mayor riesgo de broncoespasmo; valore optimización o diferir si es electiva." });
  if (f.dolorToracico === "anginoso") {
    const aN = parseInt(f.anginaCCS) || 0;
    alerts.push({ level: aN >= 3 ? "high" : "mod", text: `Dolor torácico anginoso${f.anginaCCS ? ` (CCS ${toRoman(f.anginaCCS)})` : ""}: ${aN >= 3 ? "síntomas significativos; valore optimización e interconsulta con cardiología" : "valore estudio cardiovascular según el contexto"}.` });
  }
  if (f.soplo === "diastolico" || f.soplo === "continuo") alerts.push({ level: "mod", text: `Soplo ${SOPLO[f.soplo].toLowerCase()} (siempre patológico): valore ecocardiograma e interconsulta cardiológica.` });
  if (f.aspiracion === "aumentado") alerts.push({ level: "mod", text: `Riesgo aumentado de aspiración pulmonar${f.aspiracionFactores.length ? ` (${f.aspiracionFactores.join(", ").toLowerCase()})` : ""}: considere inducción de secuencia rápida y profilaxis.` });
  if (f.hipotiroidismo && f.tiroidesControl === "no_controlado") alerts.push({ level: "mod", text: "Patología tiroidea no controlada: valore optimización antes de cirugía electiva (riesgo de tormenta tiroidea / mixedema)." });
  if (f.estadoFuncional === "parcial" || f.estadoFuncional === "total") alerts.push({ level: "mod", text: `Dependencia funcional (${NSQIP_FUNC[f.estadoFuncional].toLowerCase()}, NSQIP): asociada a mayor morbimortalidad posoperatoria.` });
  if (f.sexo === "F" && f.gestacion === "si") alerts.push({ level: "high", text: `Paciente gestante${f.semanasGestacion ? ` (${f.semanasGestacion} sem)` : ""}: implicaciones anestésicas; difiera cirugía electiva e interconsulte obstetricia.` });
  if (f.sexo === "F" && f.gestacion === "posible") alerts.push({ level: "mod", text: "Posible embarazo: confirme con prueba (β-hCG) antes de cirugía electiva." });
  if (f.transfusion === "rechaza") alerts.push({ level: "mod", text: "Rechaza hemoderivados: planifique estrategia de ahorro de sangre y documente consentimiento informado." });
  if (f.valvulopatia && f.valvSeveridad === "grave") alerts.push({ level: "high", text: "Valvulopatía grave: implicaciones hemodinámicas; valore ecocardiograma/optimización." });
  if (f.valvProtesis === "mecanica") alerts.push({ level: "mod", text: "Prótesis valvular mecánica: planifique la anticoagulación perioperatoria." });
  if (f.arrMarcapasos) alerts.push({ level: "mod", text: "Marcapasos/DAI: requiere manejo perioperatorio del dispositivo." });
  if (f.erc && f.ercDialisis !== "no") alerts.push({ level: "mod", text: "Paciente en diálisis: coordine programación, accesos vasculares y equilibrio hidroelectrolítico." });
  if (stop.level === "high") alerts.push({ level: "high", text: "Alto riesgo de SAOS: precaución con sedantes y opioides; monitorización postop." });
  if (apfel.n >= 3) alerts.push({ level: "mod", text: "Riesgo elevado de NVPO: profilaxis multimodal." });
  if (f.anticoagulantes === "si") alerts.push({ level: "mod", text: "Anticoagulantes/antiagregantes: verifique pauta de suspensión/puente." });
  if (imc >= 40) alerts.push({ level: "mod", text: "Obesidad mórbida: implicaciones en vía aérea, dosificación y posicionamiento." });
  if (f.hxFamiliarHM) alerts.push({ level: "high", text: "Antecedente familiar de hipertermia maligna: evite desencadenantes, máquina libre de halogenados." });
  if (funcLow) alerts.push({ level: "mod", text: f.capMetodo === "dasi" ? "Capacidad funcional limitada (DASI < 34): mayor riesgo perioperatorio." : "Capacidad funcional < 4 METs: valore tolerancia al procedimiento." });
  if (f.drogas) alerts.push({ level: "mod", text: "Consumo de sustancias psicoactivas: valore estimulantes, abstinencia e interacciones." });
  if (num(f.spo2) > 0 && num(f.spo2) < 90) alerts.push({ level: "high", text: "SpO₂ basal baja (< 90%): revise estado respiratorio." });
  if (num(f.hb) > 0 && num(f.hb) < 8) alerts.push({ level: "high", text: "Anemia significativa: valore manejo prequirúrgico." });
  if (charlson.total >= 5) alerts.push({ level: "high", text: "Carga de comorbilidad alta (Charlson): impacto pronóstico relevante." });
  if (egfr && egfr < 30) alerts.push({ level: "high", text: "Función renal gravemente disminuida (TFG < 30): ajuste de relajantes y fármacos de eliminación renal." });
  else if (egfr && egfr < 60) alerts.push({ level: "mod", text: "TFG 30–59: revise dosis de fármacos de eliminación renal." });
  if (ariscat.level === "high") alerts.push({ level: "high", text: "Riesgo pulmonar postoperatorio alto (ARISCAT ≥ 45): considere medidas de protección pulmonar." });
  else if (ariscat.level === "mod") alerts.push({ level: "mod", text: "Riesgo pulmonar postoperatorio intermedio (ARISCAT 26–44)." });
  if (frail && frail.frail) alerts.push({ level: cfsN >= 7 ? "high" : "mod", text: `Fragilidad (CFS ${cfsN}): mayor riesgo perioperatorio; considere valoración geriátrica y optimización.` });

  if (childPugh && childPugh.clase !== "A") alerts.push({ level: childPugh.clase === "C" ? "high" : "mod", text: `Hepatopatía Child-Pugh ${childPugh.clase} (${childPugh.score} ptos): riesgo perioperatorio elevado; valore optimización e interconsulta.` });

  return { imc, imcCat, ibw, lbm, adjbw, ebv, mabl, egfr, egfrCat, crcl, dasi, func, ipa, cardRisk, ariscat, vad, stop, rcri, apfel, asaLevel, charlson, frail, childPugh, alerts };
}

/* ──────────────────────────────── Helpers UI ─────────────────────────────── */
function Section({ icon: Icon, title, children }) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={16} className="text-teal-700" />
        <h2 className="text-[14px] font-semibold tracking-tight text-stone-800">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-stone-500">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border-0 bg-stone-50 px-3 py-2 text-[14px] text-stone-800 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600";

function Text({ v, on, type = "text", placeholder = "" }) {
  return <input type={type} value={v} placeholder={placeholder} onChange={(e) => on(e.target.value)} className={inputCls} />;
}
function Area({ v, on, rows = 2, placeholder = "" }) {
  return <textarea rows={rows} value={v} placeholder={placeholder} onChange={(e) => on(e.target.value)} className={`${inputCls} resize-y leading-snug`} />;
}
function Select({ value, on, options }) {
  return (
    <select value={value} onChange={(e) => on(e.target.value)} className={`${inputCls} appearance-none`}>
      {options.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
    </select>
  );
}

function Seg({ value, on, options, stack = false }) {
  return (
    <div className={`grid gap-1 rounded-md bg-stone-100 p-1 ring-1 ring-stone-200 ${stack ? "grid-cols-1" : ""}`}
      style={!stack ? { gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` } : {}}>
      {options.map((o) => (
        <button key={o.v} onClick={() => on(o.v)}
          className={`rounded px-2 py-1.5 text-[13px] font-medium transition ${
            value === o.v ? "bg-teal-700 text-white shadow-sm" : "text-stone-600 hover:bg-white"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Check2({ checked, on, label, className = "" }) {
  return (
    <button onClick={on} className={`flex w-full items-start gap-2 text-left ${className}`}>
      <span className={`mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded ring-1 transition ${
        checked ? "bg-teal-700 ring-teal-700" : "bg-white ring-stone-300"}`}>
        {checked && <Check size={13} className="text-white" />}
      </span>
      <span className="text-[13px] leading-snug text-stone-700">{label}</span>
    </button>
  );
}

function ScoreRow({ label, value, note, level }) {
  const s = LEVEL[level] || LEVEL.none;
  return (
    <div className="flex items-center gap-3">
      <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-medium text-stone-700">{label}</p>
        <p className="truncate text-[11px] text-stone-400">{note}</p>
      </div>
      <span className={`shrink-0 rounded-md px-2 py-1 font-mono text-[13px] tabular-nums ring-1 ${s.chip}`}>{value}</span>
    </div>
  );
}

/* Informe */
function RGroup({ title, children }) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-teal-800">{title}</p>
      <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">{children}</div>
    </div>
  );
}
function RItem({ k, v, full = false }) {
  if (!v) return null;
  return (
    <div className={`flex gap-2 text-[13px] ${full ? "sm:col-span-2" : ""}`}>
      <span className="shrink-0 text-stone-400">{k}:</span>
      <span className="text-stone-800">{v}</span>
    </div>
  );
}
function RScore({ k, v }) {
  return (
    <div className="text-[12.5px]">
      <span className="text-stone-400">{k}: </span>
      <span className="font-medium text-stone-800">{v}</span>
    </div>
  );
}

/* ──────────────────────────────── Constantes ─────────────────────────────── */
const PROC_ESC = {
  bajo: [
    "Cirugía mamaria", "Cirugía dental", "Cirugía tiroidea", "Cirugía ocular",
    "Cirugía ginecológica menor", "Cirugía ortopédica menor (p. ej. meniscectomía)",
    "Cirugía reconstructiva", "Cirugía superficial",
    "Cirugía urológica menor (p. ej. RTU de próstata)", "Resección pulmonar menor mínimamente invasiva",
  ],
  intermedio: [
    "Cirugía carotídea (asintomática)", "Reparación endovascular de aneurisma aórtico",
    "Cirugía de cabeza o cuello", "Intraperitoneal de riesgo intermedio (esplenectomía, hernia hiatal, colecistectomía)",
    "Cirugía intratorácica no mayor", "Cirugía neurológica u ortopédica mayor (prótesis articular, columna)",
    "Angioplastia arterial periférica", "Trasplante renal", "Cirugía urológica o ginecológica mayor",
  ],
  alto: [
    "Resección suprarrenal", "Cirugía aórtica y vascular mayor", "Cirugía carotídea (sintomática)",
    "Intraperitoneal de alto riesgo (pancreatoduodenal, hepática, vías biliares, esofagectomía, perforación)",
    "Revascularización abierta de MMII por isquemia aguda / amputación", "Neumonectomía",
    "Trasplante hepático", "Trasplante pulmonar", "Cistectomía total",
  ],
};
const PROC_ESC_RISK = { bajo: { label: "Bajo (< 1%)", short: "Bajo", level: "low" }, intermedio: { label: "Intermedio (1–5%)", short: "Interm.", level: "mod" }, alto: { label: "Alto (> 5%)", short: "Alto", level: "high" } };
// Clasificación de intervención NCEPOD (2004): urgencia clínica según tiempo desde la decisión de operar
const NCEPOD = [
  { v: "inmediata", g: 1, label: "Inmediata", sg: "Inmediata", t: "minutos" },
  { v: "urgente", g: 2, label: "Urgente", sg: "Urgente", t: "horas" },
  { v: "preferente", g: 3, label: "Preferente (expedita)", sg: "Preferente", t: "días" },
  { v: "electiva", g: 4, label: "Electiva", sg: "Electiva", t: "programada" },
];
// Correspondencia Carácter → urgencia clínica NCEPOD (mapeo por defecto, editable)
const CAR_TO_NCE = { electiva: "electiva", urgente: "urgente", emergencia: "inmediata" };
// Clinical Frailty Scale (Rockwood, v2.0). Validada solo en ≥ 65 años; fragilidad con CFS ≥ 5
const CFS_LEVELS = [
  { n: 1, label: "Muy en forma", desc: "Robusto, activo, enérgico; ejercicio regular; entre los más en forma para su edad." },
  { n: 2, label: "En forma", desc: "Sin enfermedad activa; algo menos en forma que el nivel 1; activo de forma ocasional." },
  { n: 3, label: "Se maneja bien", desc: "Problemas médicos controlados; activo solo en la caminata habitual." },
  { n: 4, label: "Fragilidad muy leve", desc: "Independiente, pero los síntomas lo limitan; «más lento» o cansado durante el día." },
  { n: 5, label: "Fragilidad leve", desc: "Necesita ayuda en actividades instrumentales (finanzas, transporte, tareas pesadas, compras)." },
  { n: 6, label: "Fragilidad moderada", desc: "Necesita ayuda fuera de casa y en el hogar; dificultad con escaleras y baño." },
  { n: 7, label: "Fragilidad grave", desc: "Dependiente para el cuidado personal; estable, sin alto riesgo de morir a corto plazo." },
  { n: 8, label: "Fragilidad muy grave", desc: "Totalmente dependiente, cercano al final de la vida; no se recuperaría de una enfermedad menor." },
  { n: 9, label: "Enfermo terminal", desc: "Esperanza de vida < 6 meses, sin fragilidad evidente por otra causa." },
];
// Procedimientos ESC que cumplen la definición de "cirugía de alto riesgo" del RCRI
// (intraperitoneal, intratorácica o vascular suprainguinal)
const RCRI_HIGH_PROCS = new Set([
  PROC_ESC.intermedio[3], PROC_ESC.intermedio[4],
  PROC_ESC.alto[0], PROC_ESC.alto[1], PROC_ESC.alto[3], PROC_ESC.alto[5], PROC_ESC.alto[6], PROC_ESC.alto[7], PROC_ESC.alto[8],
]);

const FEVI_LABEL = { reducida: "reducida", levemente: "levemente reducida", preservada: "preservada", desconocida: "desconocida" };
const VALV_SEV = { leve: "leve", moderada: "moderada", grave: "grave" };
const VALV_PROT = { mecanica: "prótesis mecánica", biologica: "prótesis biológica" };
const ERC_DIAL = { hd: "hemodiálisis", dp: "diálisis peritoneal" };
const ASMA_EXAC = { ninguna: "Sin exacerbaciones", lt4: "Exacerbación < 4 semanas", "4a12": "Exacerbación 4–12 semanas", gt12: "Exacerbación > 12 semanas" };
const TIROIDES = { hipotiroidismo: "Hipotiroidismo", hipertiroidismo: "Hipertiroidismo", eutiroideo: "Eutiroideo (en tratamiento)", nodulo: "Bocio / nódulo", otro: "Otro" };
// Graduación de angina — Canadian Cardiovascular Society (Campeau 1976)
const CCS_ANGINA = [
  { n: 1, label: "CCS I", desc: "La actividad ordinaria no provoca angina; solo con esfuerzo intenso, rápido o prolongado." },
  { n: 2, label: "CCS II", desc: "Ligera limitación; angina al caminar/subir escaleras rápido, cuesta arriba, tras comidas, con frío, viento o estrés." },
  { n: 3, label: "CCS III", desc: "Marcada limitación; angina al caminar 1–2 cuadras en llano o subir un piso a paso normal." },
  { n: 4, label: "CCS IV", desc: "Incapacidad para cualquier actividad sin molestia; angina posible en reposo." },
];
const RESP_SINTOMAS = ["Disnea de esfuerzo", "Tos", "Sibilancias", "Expectoración", "Hemoptisis"];
const FALLA_SINTOMAS = ["Ortopnea", "Disnea paroxística nocturna", "Edema de miembros inferiores"];
const EXAMENES_ADIC = ["Electrocardiograma", "NT-proBNP", "Troponina", "Ecocardiograma transtorácico", "Prueba de esfuerzo", "Ergoespirometría (CPET)", "Coronariografía", "Radiografía de tórax", "Espirometría / PFR", "Gasometría arterial"];
const MED_PERIOP = [
  { id: "isglt2", label: "iSGLT2 (gliflozinas)", nota: "Suspender 3–4 días antes (riesgo de cetoacidosis euglucémica). En falla cardíaca, valore el balance riesgo-beneficio." },
  { id: "glp1", label: "Agonistas GLP-1", nota: "Manejo individualizado / decisión compartida (consenso multisociedad 2024); evalúe vaciamiento gástrico y riesgo de aspiración. Si se decide suspender: diarios el día de cirugía, semanales 1 semana antes." },
  { id: "ieca", label: "IECA / ARA-II", nota: "Frecuente omitir la dosis de la mañana (hipotensión intraoperatoria), sobre todo si se usan para HTA." },
  { id: "metformina", label: "Metformina", nota: "Habitual suspender el día de la cirugía (acidosis láctica, sobre todo con deterioro renal o uso de contraste)." },
  { id: "insulina", label: "Insulina / hipoglucemiantes orales", nota: "Ajustar la dosis el día de cirugía según ayuno y glucemia." },
  { id: "betabloq", label: "Betabloqueantes", nota: "Continuar (no suspender; riesgo de isquemia/taquicardia de rebote)." },
  { id: "diureticos", label: "Diuréticos", nota: "Habitual omitir la dosis de la mañana de la cirugía." },
  { id: "corticoides", label: "Corticoides crónicos", nota: "Continuar; valore dosis de estrés perioperatoria según dosis y duración." },
  { id: "aines", label: "AINEs", nota: "Valore suspensión según riesgo de sangrado y función renal." },
  { id: "hormonal", label: "Terapia hormonal / ACO", nota: "Valore riesgo trombótico frente al procedimiento; considere suspensión según tipo de cirugía." },
  { id: "litio", label: "Litio", nota: "Valore suspensión perioperatoria (toxicidad con cambios hídricos/renales); controle niveles." },
  { id: "psico", label: "IMAO / psicofármacos", nota: "Pueden requerir planificación anestésica específica por interacciones; coordine con psiquiatría." },
];
const DOLOR_TOR = { ausente: "Ausente", no_anginoso: "No anginoso", anginoso: "Anginoso" };
const SOPLO = { ausente: "Ausente", sistolico: "Sistólico", diastolico: "Diastólico", continuo: "Continuo" };
const OX_DISP = { canula: "Cánula nasal", mascara: "Máscara facial", no_reinhalacion: "Máscara de no reinhalación", venturi: "Venturi", cnaf: "CNAF (alto flujo)", vmni: "VMNI", intubacion: "Intubación traqueal" };
function plaqTotal(f) {
  if (!f.plaquetas) return "";
  return String(Math.round(num(f.plaquetas) * 1000)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function oxLine(f) {
  if (f.oxigeno !== "si") return "";
  if (f.oxDispositivo === "intubacion") {
    const via = f.oxViaArtificial === "traqueostomia" ? `cánula de traqueostomía #${f.oxTamano || "—"}` : `tubo traqueal #${f.oxTamano || "—"}`;
    return `Vía aérea asegurada mediante ${via}${f.fio2 ? `, FiO₂ ${f.fio2}%` : ""}`;
  }
  return `Oxígeno suplementario${f.oxDispositivo ? ` por ${OX_DISP[f.oxDispositivo]}` : ""}${f.fio2 ? `, FiO₂ ${f.fio2}%` : ""}`;
}
const LAT = { na: "No aplica", izquierda: "Izquierda", derecha: "Derecha", bilateral: "Bilateral" };
const NSQIP_FUNC = { independiente: "Independiente", parcial: "Parcialmente dependiente", total: "Totalmente dependiente" };
const REVASC = { ninguna: "Sin revascularización", icp: "ICP (stent)", cabg: "Revascularización quirúrgica", ambas: "ICP + quirúrgica" };
const ASPIRA_FACTORES = ["Ayuno inadecuado / estómago lleno", "RGE / hernia hiatal", "Obstrucción intestinal / íleo", "Embarazo", "Gastroparesia / diabetes", "Obesidad", "Vía aérea difícil prevista", "Cirugía de urgencia/emergencia"];

const MET_CAT = [
  { v: "ge9", met: "≥ 9", level: "low", label: "Actividad física exigente: trotar a ritmo normal (7 min/km), cargar cajas de mudanza o similar, o más." },
  { v: "6-8", met: "6–8", level: "low", label: "Actividad física ligera: trotar despacio (9 min/km), nadar suave, cortar el césped con cortadora manual, palear nieve o similar." },
  { v: "4-5", met: "4–5", level: "low", label: "Tareas domésticas pesadas: aspirar o trapear pisos, subir un piso de escaleras (15 escalones) sin parar o similar." },
  { v: "2-3", met: "2–3", level: "mod", label: "Tareas domésticas ligeras: lavar los platos, caminar una distancia corta en terreno plano a paso lento o similar." },
  { v: "1", met: "1", level: "high", label: "Disnea con el mínimo esfuerzo, p. ej. caminar de la cama al baño." },
];

const DASI_ITEMS = [
  { label: "Cuidar de sí mismo (comer, vestirse, bañarse, ir al baño)", w: 2.75 },
  { label: "Caminar en interiores, como por su casa", w: 1.75 },
  { label: "Caminar una o dos cuadras en terreno plano", w: 2.75 },
  { label: "Subir un piso de escaleras o una cuesta", w: 5.5 },
  { label: "Correr una distancia corta", w: 8.0 },
  { label: "Tareas domésticas ligeras (quitar el polvo, lavar platos)", w: 2.7 },
  { label: "Tareas domésticas moderadas (aspirar, barrer, cargar la compra)", w: 3.5 },
  { label: "Tareas domésticas pesadas (fregar el suelo, mover muebles)", w: 8.0 },
  { label: "Trabajo de jardín (rastrillar, desmalezar, cortar el césped)", w: 4.5 },
  { label: "Tener relaciones sexuales", w: 5.25 },
  { label: "Actividades recreativas moderadas (golf, bolos, baile, tenis dobles)", w: 6.0 },
  { label: "Deportes intensos (natación, tenis individual, fútbol, baloncesto, esquí)", w: 7.5 },
];

const ASA_DESC = {
  "1": "ASA I — Paciente sano, sin enfermedad sistémica.",
  "2": "ASA II — Enfermedad sistémica leve, sin limitación funcional.",
  "3": "ASA III — Enfermedad sistémica grave con limitación funcional.",
  "4": "ASA IV — Enfermedad sistémica grave que amenaza la vida de forma constante.",
  "5": "ASA V — Paciente moribundo; no se espera supervivencia sin la cirugía.",
  "6": "ASA VI — Donante con muerte encefálica.",
};
const ASA_SHORT = { "1": "Sano", "2": "Enf. leve", "3": "Enf. grave", "4": "Amenaza vital", "5": "Moribundo", "6": "Donante" };
const CONCL = {
  apto: "Apto para el procedimiento",
  condiciones: "Apto con condiciones",
  optimizar: "Requiere optimización / estudios adicionales",
  diferir: "Se difiere el procedimiento",
};
const ANT_LABELS = {
  hta: "HTA", cardiopatiaIsq: "Cardiopatía isquémica", icc: "Insuf. cardíaca", arritmia: "Arritmia",
  valvulopatia: "Valvulopatía", ecv: "Enf. cerebrovascular", epoc: "EPOC", asma: "Asma", saos: "SAOS",
  diabetes: "Diabetes", hipotiroidismo: "Patología tiroidea",
  erc: "ERC", hepatopatia: "Hepatopatía", rge: "RGE", coagulopatia: "Coagulopatía", cancer: "Cáncer activo (≤ 5 años)",
};
const ANEST_LABEL = { General: "Anestesia general", Regional: "Anestesia regional", Neuroaxial: "Anestesia neuroaxial", Sedación: "Sedación", Combinada: "Anestesia combinada", Local: "Anestesia local", Ninguna: "Ninguna" };
function anestStr(f) { return f.tipoAnestesia.map((t) => ANEST_LABEL[t] || t).join(", "); }
function antList(f) {
  return Object.keys(ANT_LABELS).filter((k) => f[k]).map((k) => ANT_LABELS[k]).join(", ");
}
function ncepodStr(f) {
  if (!f.ncepod) return "";
  const o = NCEPOD.find((x) => x.v === f.ncepod);
  return o ? String(o.g) : "";
}
function anticoagStr(f) {
  if (f.anticoagulantes === "no") return "No";
  if (f.anticoagulantes !== "si") return "";
  const parts = [f.anticoagDetalle, f.anticoagPlanDetalle].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Sí";
}
function anestesicoStr(f) {
  const eventos = [f.vadPrevia && "vía aérea difícil previa", f.nvpoPrevia && "NVPO/cinetosis", f.hxFamiliarHM && "hist. familiar de hipertermia maligna"].filter(Boolean).join(", ");
  return [
    f.anestesiaPrevia.length && `Tipos previos: ${f.anestesiaPrevia.join(", ")}`,
    eventos && `Eventos: ${eventos}`,
    f.complicaciones && `Complicaciones: ${f.complicaciones}`,
  ].filter(Boolean).join(" · ");
}
function antFull(f, r) {
  const j = (a) => a.filter(Boolean).join(", ");
  const D = {
    cardiopatiaIsq: j([f.cardiopatiaRevasc && f.cardiopatiaRevasc !== "ninguna" ? REVASC[f.cardiopatiaRevasc] : "", f.cardiopatiaDetalle]),
    icc: j([f.iccNyha && `NYHA ${toRoman(f.iccNyha)}`, f.iccFevi && `FEVI ${FEVI_LABEL[f.iccFevi]}`, f.iccEtiologia]),
    arritmia: j([f.arrTipo, f.arrMarcapasos && "marcapasos/DAI", f.arrAnticoag && "anticoagulado"]),
    valvulopatia: j([f.valvTipo, f.valvSeveridad && VALV_SEV[f.valvSeveridad], f.valvProtesis && VALV_PROT[f.valvProtesis]]),
    ecv: f.ecvDetalle || "",
    epoc: j([f.epocO2 && "O2 domiciliario", f.epocDetalle]),
    asma: f.asmaExacerbacion && f.asmaExacerbacion !== "ninguna" ? ASMA_EXAC[f.asmaExacerbacion] : "",
    saos: f.saosCpap === "si" ? `CPAP${f.saosTitulacion ? ` ${f.saosTitulacion} cmH2O` : ""}` : f.saosCpap === "no" ? "sin CPAP" : "",
    diabetes: f.diabetesInsulina ? "insulinorequiriente" : "no insulinorequiriente",
    hipotiroidismo: j([f.tiroidesTipo && TIROIDES[f.tiroidesTipo], f.tiroidesControl === "no_controlado" ? "no controlado" : "controlado"]),
    erc: j([f.ercEstadio && `estadio ${f.ercEstadio}`, f.ercDialisis && ERC_DIAL[f.ercDialisis]]),
    hepatopatia: r.childPugh ? `Child-Pugh ${r.childPugh.score}, clase ${r.childPugh.clase}` : "",
    cancer: f.cancerTipo || "",
  };
  return Object.keys(ANT_LABELS).filter((k) => f[k]).map((k) => (D[k] ? `${ANT_LABELS[k]} (${D[k]})` : ANT_LABELS[k]));
}
function hemoStr(f) {
  const parts = [
    f.hemoCGR && `Glóbulos rojos ×${f.hemoCGR}`,
    f.hemoPFC && `Plasma fresco ×${f.hemoPFC}`,
    f.hemoPlaq && `Plaquetas ×${f.hemoPlaq}`,
    f.hemoCrio && `Crioprecipitado ×${f.hemoCrio}`,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "Reservados";
}
function toRoman(n) { return ["I", "II", "III", "IV", "V", "VI"][parseInt(n) - 1] || ""; }
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }
function fmtDateTime(v) {
  if (!v) return "";
  const [d, t] = v.split("T");
  if (!d) return v;
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}${t ? ` ${t}` : ""}`;
}

function buildReport(f, r) {
  const L = [];
  L.push("INFORME DE VALORACIÓN PREANESTÉSICA");
  L.push(f.fecha || new Date().toLocaleDateString("es-CO"));
  L.push("");
  L.push(`Paciente: ${f.nombre || "—"}  Doc: ${f.documento || "—"}  Edad: ${f.edad || "—"}  Sexo: ${f.sexo || "—"}`);
  if (f.sexo === "F" && f.gestacion !== "no") L.push(`Estado gestacional: ${f.gestacion === "si" ? `gestante${f.semanasGestacion ? ` (${f.semanasGestacion} sem)` : ""}` : "posible embarazo"}${f.fum ? ` · FUM ${f.fum}` : ""}`);
  L.push(`Peso/Talla: ${f.peso || "—"} kg / ${f.talla || "—"} cm  IMC: ${r.imc ? r.imc.toFixed(1) : "—"} (${r.imcCat.label})`);
  L.push(`Peso ideal (Devine): ${r.ibw ? r.ibw.toFixed(1) + " kg" : "—"} · Masa libre de grasa (FFM, Janmahasatian): ${r.lbm ? r.lbm.toFixed(1) + " kg" : "—"} · Peso ajustado (AdjBW): ${r.adjbw ? r.adjbw.toFixed(1) + " kg" : "—"}`);
  L.push(`Cirugía: ${f.cirugia || "—"} (${cap(f.caracter)})${f.lateralidad !== "na" ? ` · ${LAT[f.lateralidad]}` : ""}${f.altoRiesgoQx ? " · alto riesgo" : ""}`);
  if (f.ncepod) L.push(`Urgencia clínica (NCEPOD 2004): ${ncepodStr(f)}`);
  if (f.procedimientoEsc) L.push(`Procedimiento (ESC 2022): ${f.procedimientoEsc} — riesgo cardíaco ${r.cardRisk.label}`);
  L.push("");
  const antsR = antFull(f, r);
  if (antsR.length) {
    L.push("Antecedentes patológicos:");
    antsR.forEach((a) => L.push(`  - ${a}`));
    if (f.antecedentesOtros) L.push(`  - Otros: ${f.antecedentesOtros}`);
  } else {
    L.push(`Antecedentes patológicos: Niega${f.antecedentesOtros ? ` · ${f.antecedentesOtros}` : ""}`);
  }
  L.push(`Quirúrgicos: ${f.cirugiasPrevias || "—"}`);
  L.push(`Anestésicos: ${anestesicoStr(f) || "—"}`);
  if (f.transfusion) L.push(`Transfusión: ${f.transfusion === "si" ? `sí${f.transfusionDetalle ? ` (${f.transfusionDetalle})` : ""}` : f.transfusion === "rechaza" ? "rechaza hemoderivados" : "no"}`);
  L.push(`Medicación: ${f.tomaMedicacion === "no" ? "Niega" : f.tomaMedicacion === "si" ? (f.medicacion || "Sí, sin especificar") : (f.medicacion || "—")}`);
  if (f.anticoagulantes === "si") L.push(`Anticoagulación/antiagregación: ${anticoagStr(f)}`);
  L.push(`Alergias: ${f.tieneAlergias === "no" ? "Niega" : f.tieneAlergias === "si" ? (f.alergias || "Sí, sin especificar") : (f.alergias || "—")}`);
  L.push(`Capacidad funcional: ${r.func.text}`);
  L.push(`Estado funcional (NSQIP): ${NSQIP_FUNC[f.estadoFuncional]}`);
  if (f.tabaco === "activo" || f.tabaco === "ex") L.push(`Tabaco: ${f.tabaco === "activo" ? "activo" : "ex-fumador"}${r.ipa ? ` · IPA ${r.ipa.toFixed(1)} paquetes-año` : ""}`);
  L.push("");
  L.push(`Dolor torácico: ${DOLOR_TOR[f.dolorToracico]}${f.dolorToracico === "anginoso" && f.anginaCCS ? ` · angina CCS ${toRoman(f.anginaCCS)}` : ""}`);
  if (f.sintResp.length) L.push(`Síntomas respiratorios: ${f.sintResp.join(", ")}`);
  if (f.sintFalla.length) L.push(`Síntomas de falla cardíaca: ${f.sintFalla.join(", ")}`);
  if (f.rosObs) L.push(`Otros síntomas: ${f.rosObs}`);
  L.push("");
  L.push(`Vía aérea: Mallampati ${f.mallampati ? toRoman(f.mallampati) : "—"}, ULBT ${f.mordida ? "clase " + toRoman(f.mordida) : "—"}, ${r.vad.n} predictores VAD`);
  if (f.viaAereaObs) L.push(`  Observaciones vía aérea: ${f.viaAereaObs}`);
  if (f.aspiracion === "aumentado") L.push(`Riesgo de aspiración pulmonar: aumentado${f.aspiracionFactores.length ? ` (${f.aspiracionFactores.join(", ")})` : ""}`);
  if (oxLine(f)) L.push(oxLine(f));
  if (f.soplo && f.soplo !== "ausente") L.push(`Soplo cardíaco: ${SOPLO[f.soplo]}`);
  const exParts = [
    f.exCardio && `CV: ${f.exCardio}`,
    f.exResp && `Resp: ${f.exResp}`,
    f.exAbdomen && `Abd: ${f.exAbdomen}`,
    f.exNeuro && `Neuro: ${f.exNeuro}`,
  ].filter(Boolean);
  if (exParts.length) L.push(`Examen físico: ${exParts.join(" · ")}`);
  L.push(`Escalas: ASA ${f.asa ? toRoman(f.asa) + (f.asaUrgencia ? "E" : "") : "—"} · STOP-BANG ${r.stop.n}/8 (${r.stop.label}) · RCRI ${r.rcri.n} (${r.rcri.label}) · Apfel ${r.apfel.n}/4 (${r.apfel.pct})`);
  L.push(`Charlson (edad-aj.): ${r.charlson.total} — superv. estimada 10 años ~${r.charlson.surv}%`);
  L.push(`ARISCAT (pulmonar): ${r.ariscat.score} — ${r.ariscat.label}, CPP estimadas ${r.ariscat.pct}`);
  if (r.frail) L.push(`Fragilidad (CFS): ${r.frail.n} — ${r.frail.label}${r.frail.frail ? " (fragilidad)" : ""}`);
  L.push(`Hto: ${f.hematocrito ? f.hematocrito + "%" : "—"} · Volemia est.: ${r.ebv ? Math.round(r.ebv) + " mL" : "—"} · Pérdida permisible (Gross, Hb objetivo ${f.hbObjetivo || "—"} g/dL): ${r.mabl ? Math.round(r.mabl) + " mL" : "—"}`);
  if (r.egfr) L.push(`TFG (CKD-EPI 2021): ${r.egfr} mL/min/1,73m² (${r.egfrCat.stage} · ${r.egfrCat.label})`);
  if (r.crcl) L.push(`ClCr (Cockcroft-Gault, ${{ real: "peso real", ideal: "peso ideal", ajustado: "peso ajustado" }[f.cgPeso]}): ${r.crcl} mL/min`);
  L.push("");
  L.push(`Plan: ${anestStr(f) || "—"}`);
  if (f.ayunoIncluir) {
    L.push("Recomendaciones de ayuno preoperatorio (consenso 2026):");
    L.push(`  - Líquidos claros (agua, té/café solos, zumo sin pulpa, isotónicas): hasta ${f.ayunoClaros} h antes`);
    L.push(`  - Comida ligera / líquidos no claros (tostada, leche, lácteos): ${f.ayunoLigera} h antes`);
    L.push(`  - Comida copiosa o grasa (fritos, carne, comidas abundantes): ${f.ayunoCopiosa} h antes`);
  }
  L.push(`Ayuno (indicaciones adicionales): ${f.ayuno || "—"}`);
  if (f.consideraciones) L.push(`Consideraciones: ${f.consideraciones}`);
  if (f.medPeriop.length || f.medPeriopPlan) L.push(`Medicación crónica perioperatoria: ${[MED_PERIOP.filter((m) => f.medPeriop.includes(m.id)).map((m) => m.label).join(", "), f.medPeriopPlan].filter(Boolean).join(" — ")}`);
  L.push(`Disposición postop.: ${{ ninguna: "Hospitalización en sala", intermedio: "Cuidado intermedio", uci: "UCI" }[f.reservaCama]}${f.reservaHemo ? " · Hemoderivados: " + hemoStr(f) : ""}`);
  if (f.solicitaEstudios === "si" && (f.examenesAdic.length || f.examenesAdicOtros)) L.push(`Estudios complementarios solicitados: ${[f.examenesAdic.join(", "), f.examenesAdicOtros].filter(Boolean).join(", ")}`);
  L.push("");
  L.push(`CONCLUSIÓN: ${CONCL[f.conclusion] || "Sin definir"}`);
  if (f.recomendaciones) L.push(`Recomendaciones: ${f.recomendaciones}`);
  if (f.evaluador || f.fechaValoracion) {
    L.push("");
    L.push(`Valorado por: ${f.evaluador || "—"}${f.evaluadorRegistro ? ` (Reg. ${f.evaluadorRegistro})` : ""}${f.fechaValoracion ? ` — ${fmtDateTime(f.fechaValoracion)}` : ""}`);
  }
  return L.join("\n");
}

function buildHC(f, r) {
  const J = (a) => a.filter(Boolean).join(", ");
  const ap = f.aperturaOral === "lt3" ? "< 3 cm" : ">= 3 cm";
  const dtm = f.distTiro === "lt6" ? "< 6 cm" : ">= 6 cm";
  const sexo = f.sexo === "M" ? "Masculino" : f.sexo === "F" ? "Femenino" : "No registra";
  const L = [];
  L.push("HISTORIA CLINICA - VALORACION PREANESTESICA");
  L.push(`Fecha: ${f.fecha || new Date().toLocaleDateString("es-CO")}`);
  L.push("");
  L.push(`Nombre: ${f.nombre || "No registra"}`);
  L.push(`Documento: ${f.documento || "No registra"}`);
  if (f.fechaNacimiento) L.push(`Fecha de nacimiento: ${f.fechaNacimiento}`);
  L.push(`Edad: ${f.edad || "—"}`);
  L.push(`Sexo: ${sexo}`);
  if (f.sexo === "F" && f.gestacion !== "no") L.push(`Estado gestacional: ${f.gestacion === "si" ? `gestante${f.semanasGestacion ? ` (${f.semanasGestacion} semanas)` : ""}` : "posible embarazo"}.${f.fum ? ` FUM ${f.fum}.` : ""}`);
  L.push("");
  L.push(`Procedimiento propuesto: ${f.cirugia || "No registra"}`);
  L.push(`Caracter: ${cap(f.caracter)}`);
  if (f.lateralidad !== "na") L.push(`Lateralidad: ${LAT[f.lateralidad]}`);
  if (f.ncepod) L.push(`Urgencia NCEPOD: ${ncepodStr(f)}`);
  if (f.procedimientoEsc) L.push(`Riesgo cardiaco ESC 2022: ${r.cardRisk.label}`);
  L.push("");
  const ants = antFull(f, r);
  L.push(`Antecedentes patologicos: ${ants.length ? ants.join("; ") : "Niega"}.${f.antecedentesOtros ? ` Otros: ${f.antecedentesOtros}.` : ""}`);
  L.push(`Antecedentes quirurgicos: ${f.cirugiasPrevias || "No registra"}.`);
  const evHC = [f.vadPrevia && "via aerea dificil previa", f.nvpoPrevia && "NVPO/cinetosis", f.hxFamiliarHM && "hist. familiar de hipertermia maligna"].filter(Boolean).join(", ");
  const anHC = [f.anestesiaPrevia.length && `tipos previos: ${f.anestesiaPrevia.join(", ")}`, evHC && `eventos: ${evHC}`, f.complicaciones && `complicaciones: ${f.complicaciones}`].filter(Boolean).join("; ");
  L.push(`Antecedentes anestesicos: ${anHC || "No registra"}.`);
  if (f.transfusion) L.push(`Transfusion previa: ${f.transfusion === "si" ? `si${f.transfusionDetalle ? ` (${f.transfusionDetalle})` : ""}` : f.transfusion === "rechaza" ? "rechaza hemoderivados" : "no"}.`);
  L.push(`Medicamentos: ${f.tomaMedicacion === "no" ? "Niega" : (f.medicacion || "Sin especificar")}.${f.anticoagulantes === "si" ? ` Anticoagulacion/antiagregacion: ${f.anticoagDetalle || "Si"}.` : ""}`);
  L.push(`Alergias: ${f.tieneAlergias === "no" ? "Niega" : (f.alergias || "Sin especificar")}.`);
  const hab = [];
  if (f.tabaco === "activo" || f.tabaco === "ex") hab.push(`Tabaquismo ${f.tabaco === "activo" ? "activo" : "ex-fumador"}${r.ipa ? ` (IPA ${r.ipa.toFixed(1)})` : ""}`);
  if (f.alcohol === "social" || f.alcohol === "abuso") hab.push(`Alcohol ${f.alcohol}`);
  if (f.drogas) hab.push(`Sustancias psicoactivas${f.sustanciasDetalle ? ` (${f.sustanciasDetalle})` : ""}`);
  L.push(`Habitos: ${hab.length ? J(hab) : "Niega"}.`);
  if (r.frail) L.push(`Fragilidad (CFS): ${r.frail.n} - ${r.frail.label}${r.frail.frail ? " (fragil)" : ""}.`);
  L.push("");
  L.push(`Revision por sistemas: dolor toracico ${DOLOR_TOR[f.dolorToracico]}${f.dolorToracico === "anginoso" && f.anginaCCS ? ` (angina CCS ${toRoman(f.anginaCCS)})` : ""}.${f.sintResp.length ? ` Respiratorios: ${f.sintResp.join(", ")}.` : ""}${f.sintFalla.length ? ` Falla cardiaca: ${f.sintFalla.join(", ")}.` : ""}${f.rosObs ? ` Otros: ${f.rosObs}.` : ""}`);
  L.push(`Capacidad funcional: ${r.func.text}.`);
  L.push(`Estado funcional (NSQIP): ${NSQIP_FUNC[f.estadoFuncional]}.`);
  L.push("");
  L.push(`Via aerea: Mallampati ${f.mallampati ? toRoman(f.mallampati) : "—"}, ULBT ${f.mordida ? "clase " + toRoman(f.mordida) : "—"}, apertura oral ${ap}, DTM ${dtm}, movilidad cervical ${cap(f.movilidadCervical)}, dentadura ${cap(f.dentadura)}. Predictores VAD ${r.vad.n}.`);
  if (f.viaAereaObs) L.push(`Observaciones via aerea: ${f.viaAereaObs}.`);
  if (f.aspiracion === "aumentado") L.push(`Riesgo de aspiracion pulmonar: aumentado${f.aspiracionFactores.length ? ` (${f.aspiracionFactores.join(", ")})` : ""}.`);
  L.push("");
  const vit = J([f.ta && `TA ${f.ta}`, f.fc && `FC ${f.fc}`, f.spo2 && `SpO2 ${f.spo2}%`]);
  L.push(`Examen fisico: peso ${f.peso || "—"} kg, talla ${f.talla || "—"} cm, IMC ${r.imc ? r.imc.toFixed(1) : "—"} (${r.imcCat.label}).${vit ? ` ${vit}.` : ""}`);
  if (f.oxigeno === "si") {
    if (f.oxDispositivo === "intubacion") {
      const via = f.oxViaArtificial === "traqueostomia" ? `canula de traqueostomia #${f.oxTamano || "—"}` : `tubo traqueal #${f.oxTamano || "—"}`;
      L.push(`Via aerea asegurada mediante ${via}${f.fio2 ? `, FiO2 ${f.fio2}%` : ""}.`);
    } else {
      L.push(`Oxigeno suplementario${f.oxDispositivo ? ` por ${OX_DISP[f.oxDispositivo]}` : ""}${f.fio2 ? `, FiO2 ${f.fio2}%` : ""}.`);
    }
  }
  if (f.soplo && f.soplo !== "ausente") L.push(`Soplo cardiaco: ${SOPLO[f.soplo]}.`);
  const ex = J([f.exCardio && `CV: ${f.exCardio}`, f.exResp && `Resp: ${f.exResp}`, f.exAbdomen && `Abd: ${f.exAbdomen}`, f.exNeuro && `Neuro: ${f.exNeuro}`]);
  if (ex) L.push(`${ex}.`);
  L.push("");
  const lab = J([
    f.hb && `Hb ${f.hb} g/dL`, f.hematocrito && `Hto ${f.hematocrito}%`, f.plaquetas && `Plaquetas ${plaqTotal(f)}/uL`,
    f.inr && `INR ${f.inr}`, f.creatinina && `Creatinina ${f.creatinina} mg/dL`, f.glucemia && `Glucemia ${f.glucemia} mg/dL`,
    r.egfr && `TFG ${r.egfr} mL/min/1.73 (${r.egfrCat.stage})`, r.crcl && `ClCr ${r.crcl} mL/min`,
  ]);
  L.push(`Paraclinicos: ${lab || "No registra"}.`);
  const est = J([f.ecg && `ECG: ${f.ecg}`, f.rxTorax && `Rx torax: ${f.rxTorax}`, f.otrosEstudios && `Otros: ${f.otrosEstudios}`]);
  if (est) L.push(`Estudios: ${est}.`);
  L.push("");
  L.push("Estratificacion de riesgo:");
  L.push(`- ASA ${f.asa ? toRoman(f.asa) + (f.asaUrgencia ? "E" : "") : "—"}${f.asa ? `: ${ASA_SHORT[f.asa] || ""}` : ""}`);
  L.push(`- RCRI (Lee): ${r.rcri.n} (${r.rcri.label})`);
  if (f.procedimientoEsc) L.push(`- Riesgo cardiaco ESC 2022: ${r.cardRisk.label}`);
  L.push(`- ARISCAT (pulmonar): ${r.ariscat.score} (${r.ariscat.label}, CPP ${r.ariscat.pct})`);
  L.push(`- Charlson (edad-aj.): ${r.charlson.total} (superv. 10a ~${r.charlson.surv}%)`);
  L.push(`- Apfel (NVPO): ${r.apfel.n}/4 (${r.apfel.pct})`);
  L.push(`- STOP-BANG: ${r.stop.n}/8 (${r.stop.label})`);
  if (r.frail) L.push(`- Fragilidad CFS: ${r.frail.n} (${r.frail.label})`);
  L.push("");
  L.push(`Plan anestesico: ${anestStr(f) || "No definido"}.`);
  if (f.ayunoIncluir) L.push(`Ayuno: claros ${f.ayunoClaros} h, comida ligera ${f.ayunoLigera} h, comida copiosa ${f.ayunoCopiosa} h.`);
  if (f.ayuno) L.push(`Ayuno (adicional): ${f.ayuno}.`);
  if (f.consideraciones) L.push(`Consideraciones: ${f.consideraciones}.`);
  if (f.medPeriopPlan) L.push(`Medicacion cronica perioperatoria: ${f.medPeriopPlan}.`);
  L.push(`Disposicion postoperatoria: ${{ ninguna: "Hospitalizacion en sala", intermedio: "Cuidado intermedio", uci: "UCI" }[f.reservaCama]}.${f.reservaHemo ? ` Hemoderivados: ${hemoStr(f)}.` : ""}`);
  if (f.solicitaEstudios === "si" && (f.examenesAdic.length || f.examenesAdicOtros)) L.push(`Estudios complementarios solicitados: ${[f.examenesAdic.join(", "), f.examenesAdicOtros].filter(Boolean).join(", ")}.`);
  L.push("");
  L.push(`Conclusion: ${CONCL[f.conclusion] || "Sin definir"}.`);
  if (f.conclusion === "apto" || f.conclusion === "condiciones") {
    const sexoN = f.sexo === "M" ? "masculino" : f.sexo === "F" ? "femenino" : "—";
    const asaTxt = f.asa ? toRoman(f.asa) + (f.asaUrgencia ? "E" : "") : "—";
    const riesgoProc = { low: "bajo", mod: "intermedio", high: "alto" }[r.cardRisk.level] || "no determinado";
    const card = [];
    if (f.hta) card.push("hipertension arterial");
    if (f.cardiopatiaIsq) card.push(`cardiopatia isquemica${f.cardiopatiaRevasc && f.cardiopatiaRevasc !== "ninguna" ? ` (${REVASC[f.cardiopatiaRevasc]})` : ""}`);
    if (f.icc) card.push(`insuficiencia cardiaca${f.iccNyha ? ` NYHA ${toRoman(f.iccNyha)}` : ""}`);
    if (f.arritmia) card.push(`arritmia${f.arrTipo ? ` (${f.arrTipo})` : ""}`);
    if (f.valvulopatia) card.push("valvulopatia");
    const cardTxt = card.length ? `con antecedente de ${card.join(", ")}, ` : "";
    const leeClase = r.rcri.n >= 3 ? "IV" : r.rcri.n === 2 ? "III" : r.rcri.n === 1 ? "II" : "I";
    const leePct = r.rcri.n >= 3 ? "11" : r.rcri.n === 2 ? "6.6" : r.rcri.n === 1 ? "0.9" : "0.4";
    const vadTxt = r.vad.n > 0 ? "con" : "sin";
    const aspTxt = f.aspiracion === "aumentado" ? "riesgo aumentado de aspiracion pulmonar" : "bajo riesgo de aspiracion pulmonar";
    L.push("");
    L.push("ANALISIS:");
    L.push(`Paciente ${sexoN} de ${f.edad || "—"} años ASA ${asaTxt} quien requiere ${f.cirugia || "el procedimiento descrito"}, procedimiento quirurgico de riesgo ${riesgoProc}${f.ncepod ? `, NCEPOD ${ncepodStr(f)}` : ""}, capacidad funcional ${r.func.text}, ${cardTxt}indice de Lee con puntaje de ${r.rcri.n} (clase ${leeClase}, riesgo del ${leePct}% de evento cardiaco mayor), ${vadTxt} predictores de via aerea dificil. ${aspTxt}. Se puede programar con las siguientes recomendaciones:`);
    const recs = [];
    if (f.ayunoIncluir) recs.push(`Ayuno preoperatorio: liquidos claros ${f.ayunoClaros} h, comida ligera ${f.ayunoLigera} h, comida copiosa/grasa ${f.ayunoCopiosa} h.${f.ayuno ? ` ${f.ayuno}.` : ""}`);
    else if (f.ayuno) recs.push(`Ayuno: ${f.ayuno}.`);
    if (f.medPeriopPlan) recs.push(`Manejo de medicacion cronica perioperatoria: ${f.medPeriopPlan}.`);
    if (f.anticoagulantes === "si" && f.anticoagPlanDetalle) recs.push(`Manejo perioperatorio de anticoagulacion/antiagregacion: ${f.anticoagPlanDetalle}.`);
    if (r.vad.n > 0 || f.aspiracion === "aumentado") recs.push(`${r.vad.n > 0 ? "Disponer equipo y plan de via aerea dificil" : "Precaucion en via aerea"}${f.aspiracion === "aumentado" ? "; riesgo aumentado de aspiracion: considerar induccion de secuencia rapida y profilaxis" : ""}.${f.viaAereaObs ? ` ${f.viaAereaObs}.` : ""}`);
    if (f.solicitaEstudios === "si" && (f.examenesAdic.length || f.examenesAdicOtros)) recs.push(`Se solicita ${[f.examenesAdic.join(", "), f.examenesAdicOtros].filter(Boolean).join(", ")}.`);
    if (f.reservaHemo) recs.push(`Reserva de hemoderivados: ${hemoStr(f)}.`);
    const disp = [];
    const camaTxt = { ninguna: "", intermedio: "reserva de cama en cuidado intermedio", uci: "reserva de cama en UCI" }[f.reservaCama];
    if (camaTxt) disp.push(camaTxt);
    if (f.reservaObs) disp.push(f.reservaObs);
    if (disp.length) recs.push(`Disposicion postoperatoria: ${disp.join("; ")}.`);
    if (f.recomendaciones) (f.recomendaciones || "").split(/\n+/).map((s) => s.trim()).filter(Boolean).forEach((s) => recs.push(s));
    if (recs.length) recs.forEach((rl, i) => L.push(`${i + 1}. ${rl}`));
  } else if (f.recomendaciones) {
    L.push(`Recomendaciones: ${f.recomendaciones}.`);
  }
  L.push("");
  if (f.evaluador || f.fechaValoracion) {
    L.push(`Valorado por: ${f.evaluador || "____________________"}`);
    L.push(`Registro: ${f.evaluadorRegistro || "__________"}`);
    L.push(`Fecha: ${f.fechaValoracion ? fmtDateTime(f.fechaValoracion) : "__________"}`);
  } else {
    L.push("Valorado por: ____________________");
    L.push("Registro: __________");
    L.push("Fecha: __________");
  }
  L.push("");
  L.push("Documento de apoyo; no sustituye el juicio clinico del anestesiologo responsable.");
  return L.join("\n").toUpperCase();
}
