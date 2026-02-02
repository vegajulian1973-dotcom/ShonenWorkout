import { HfInference } from "@huggingface/inference";

const hf = new HfInference(import.meta.env.VITE_HF_TOKEN);

export const generarPlanIntegral = async (datos) => {
  try {
    const prompt = `
      SISTEMA DE ASIGNACIÓN DE MISIONES: PROTOCOLO SOLO LEVELING.
      
      CAZADOR: ${datos.nombre}
      OBJETIVO: ${datos.objetivo}
      ZONA: ${datos.lugarEntrenamiento}
      RANGO: ${datos.imc}

      REGLAS DE GENERACIÓN CRÍTICAS (FALLAR RESULTARÁ EN PENALIZACIÓN):
      1. RUTINA COMPLETA: Genera los 7 días de la semana. 
      2. MISIONES DIARIAS: Cada día de entrenamiento (Lunes a Sábado) DEBE tener EXACTAMENTE 7 ejercicios diferentes.
      3. FORMATO DE EJERCICIO: "01. Nombre (Series x Reps) - Descanso: XXs - Nota, 02. Nombre...". 
         IMPORTANTE: Separa los ejercicios por COMAS dentro del string.
      4. DIETA SEMANAL: Cada día (Lunes a Domingo) debe tener un menú completo con Desayuno, Comida y Cena.
      5. LENGUAJE: Usa narrativa de Solo Leveling (Misiones, Fatiga, Subir de nivel).

      RESPUESTA ÚNICAMENTE EN JSON PURO:
      {
        "nombre_plan": "DESPERTAR DE ${datos.nombre.toUpperCase()}",
        "frase_motivacional": "Una frase épica corta de Solo Leveling",
        "rutina": {
          "Lunes": "01. Ejercicio..., 02. Ejercicio..., 03. Ejercicio..., 04. Ejercicio..., 05. Ejercicio..., 06. Ejercicio..., 07. Ejercicio...",
          "Martes": "...",
          "Miércoles": "...",
          "Jueves": "...",
          "Viernes": "...",
          "Sábado": "...",
          "Domingo": "RESTAURACIÓN DE ESTADO: Día de descanso total para evitar penalización por fatiga."
        },
        "dieta_semanal": {
          "Lunes": "Desayuno: ..., Comida: ..., Cena: ...",
          "Martes": "...",
          "Miércoles": "...",
          "Jueves": "...",
          "Viernes": "...",
          "Sábado": "...",
          "Domingo": "..."
        }
      }
    `;

    const out = await hf.chatCompletion({
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3500, // Aumentado para asegurar que quepan los 7 ejercicios x 7 días
      temperature: 0.6, // Bajamos un poco la temperatura para que sea más preciso con el formato
    });

    const respuesta = out.choices[0].message.content;
    
    // Extraer el JSON de forma segura
    const inicioJson = respuesta.indexOf('{');
    const finJson = respuesta.lastIndexOf('}') + 1;
    
    if (inicioJson === -1 || finJson === 0) {
      throw new Error("El Oráculo no devolvió un formato de misión válido.");
    }

    const jsonLimpiado = respuesta.substring(inicioJson, finJson);
    return JSON.parse(jsonLimpiado);

  } catch (error) {
    console.error("Error en el Oráculo (Hugging Face):", error);
    return null;
  }
};