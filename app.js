// app.js

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('datos-paciente');
    const resultadosSection = document.getElementById('resultados');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calcularTratamiento();
    });

    function calcularTratamiento() {
        // Obtener los valores del formulario
        const edad = parseFloat(document.getElementById('edad').value);
        const peso = parseFloat(document.getElementById('peso').value);
        const deshidratacion = parseFloat(document.getElementById('deshidratacion').value);
        const glucemia = parseFloat(document.getElementById('glucemia').value);
        const sodio = parseFloat(document.getElementById('sodio').value);
        const shock = document.getElementById('shock').value;

        // Validación básica
        if (isNaN(edad) || isNaN(peso) || isNaN(deshidratacion) || isNaN(glucemia) || isNaN(sodio)) {
            alert("Por favor, complete todos los campos con valores numéricos válidos.");
            return;
        }

        // Primera fase de tratamiento
        let volumenInicial = calcularVolumenInicial(peso, shock);

        // Segunda fase de tratamiento
        let mantenimientoDiario = calcularMantenimientoDiario(peso);
        let deficitHidrico = calcularDeficitHidrico(peso, deshidratacion);
        let deficitEn24Horas = deficitHidrico / 2;
        let volumenTotal24Horas = calcularVolumenTotal24Horas(mantenimientoDiario, deficitEn24Horas, volumenInicial);
        let dosisInsulina = calcularDosisInsulina(peso);

        // Tercera fase de tratamiento
        let volumenTotalTerceraFase = mantenimientoDiario + deficitEn24Horas;
        let dosisTotalDiariaInsulina = calcularDosisTotalDiariaInsulina(edad, peso);
        let distribucionInsulina = calcularDistribucionInsulina(dosisTotalDiariaInsulina);
        let indiceSensibilidad = calcularIndiceSensibilidad(dosisTotalDiariaInsulina);

        // Presentación mejorada de los resultados
        let resultado = `
            <div class="resultado-seccion">
                <h3>Datos del paciente:</h3>
                <ul>
                    <li>Edad: ${edad} años</li>
                    <li>Peso: ${peso} kg</li>
                    <li>Deshidratación: ${deshidratacion}%</li>
                    <li>Glucemia: ${glucemia} mg/dL</li>
                    <li>Sodio: ${sodio} mmol/L</li>
                    <li>Shock: ${shock === 'si' ? 'Sí' : 'No'}</li>
                </ul>
            </div>

            <div class="resultado-seccion">
                <h3>Primera fase de tratamiento (1-2 horas):</h3>
                <ul>
                    <li>Reposición Hídrica Inicial (bolo): ${volumenInicial.toFixed(2)} ml de solución salina isotónica (0.9% NaCl)</li>
                    <li>Velocidad de administración del bolo: ${volumenInicial.toFixed(2)} ml en 1 hora</li>
                </ul>
            </div>

            <div class="resultado-seccion">
                <h3>Segunda fase de tratamiento (3-24h):</h3>
                <ul>
                    <li>Mantenimiento diario: ${mantenimientoDiario.toFixed(2)} ml/día</li>
                    <li>Déficit hídrico total: ${deficitHidrico.toFixed(2)} ml</li>
                    <li>Déficit a reponer en 24 horas: ${deficitEn24Horas.toFixed(2)} ml</li>
                    <li>Volumen total a administrar en las siguientes 23 horas: ${volumenTotal24Horas.toFixed(2)} ml</li>
                    <li>Velocidad de infusión: ${(volumenTotal24Horas / 23).toFixed(2)} ml/hora</li>
                    <li>Dosis de insulina: ${dosisInsulina.toFixed(2)} unidades/hora</li>
                </ul>
            </div>

            <div class="resultado-seccion">
                <h3>Tercera fase de tratamiento:</h3>
                <ul>
                    <li>Volumen total a administrar: ${volumenTotalTerceraFase.toFixed(2)} ml</li>
                    <li>Dosis total diaria de insulina: ${dosisTotalDiariaInsulina.toFixed(2)} unidades</li>
                    <li>Distribución de insulina:
                        <ul>
                            <li>Insulina lenta (basal): ${distribucionInsulina.basal.toFixed(2)} unidades</li>
                            <li>Insulina rápida (bolo):
                                <ul>
                                    <li>Desayuno: ${distribucionInsulina.desayuno.toFixed(2)} unidades</li>
                                    <li>Almuerzo: ${distribucionInsulina.almuerzo.toFixed(2)} unidades</li>
                                    <li>Merienda: ${distribucionInsulina.merienda.toFixed(2)} unidades</li>
                                    <li>Cena: ${distribucionInsulina.cena.toFixed(2)} unidades</li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    <li>Índice de Sensibilidad: ${indiceSensibilidad.toFixed(2)} mg/dL por unidad de insulina</li>
                    <li>
                        <p>Para calcular la pauta móvil usamos el índice de sensibilidad, que nos indica cuántos mg/dL de glucemia bajan por cada unidad de insulina que administramos a nuestro paciente (que sensibilidad tiene a la insulina).</p>
                        <p>Para hacer útil el IS, si nos da un resultado muy elevado por cada unidad, podemos usar medias unidades y así ajustar los intervalos más cortos.</p>
                    </li>
                </ul>
            </div>
        `;

        resultadosSection.innerHTML = resultado;
    }

    function calcularVolumenInicial(peso, shock) {
        return shock === 'si' ? peso * 20 : peso * 10;
    }

    function calcularMantenimientoDiario(peso) {
        if (peso <= 10) {
            return peso * 100;
        } else if (peso <= 20) {
            return 1000 + (peso - 10) * 50;
        } else {
            return 1500 + (peso - 20) * 20;
        }
    }

    function calcularDeficitHidrico(peso, deshidratacion) {
        return peso * deshidratacion * 10;
    }

    function calcularVolumenTotal24Horas(mantenimientoDiario, deficitEn24Horas, volumenInicial) {
        let volumenTotal = mantenimientoDiario + deficitEn24Horas - volumenInicial;
        let maximoPermitido = mantenimientoDiario * 2 - volumenInicial;
        return Math.max(0, Math.min(volumenTotal, maximoPermitido));
    }

    function calcularDosisInsulina(peso) {
        return peso * 0.1;
    }

    function calcularDosisTotalDiariaInsulina(edad, peso) {
        if (edad < 5) {
            return peso * 0.5;
        } else if (edad > 10) {
            return peso * 1;
        } else {
            return peso * 0.75;
        }
    }

    function calcularDistribucionInsulina(dosisTotalDiaria) {
        const mitad = dosisTotalDiaria / 2;
        return {
            basal: mitad,
            desayuno: mitad * 0.30,
            almuerzo: mitad * 0.25,
            merienda: mitad * 0.20,
            cena: mitad * 0.25
        };
    }

    function calcularIndiceSensibilidad(dosisTotalDiaria) {
        return 1800 / dosisTotalDiaria;
    }
});
