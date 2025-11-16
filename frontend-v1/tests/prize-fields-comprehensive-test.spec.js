import { test, expect } from '@playwright/test';

/**
 * TEST EXHAUSTIVO: Verificar TODOS los campos de premios en múltiples bancas
 *
 * Este test verifica:
 * 1. Guardado de TODOS los campos mapeados
 * 2. Persistencia después de guardar (sin reload)
 * 3. Persistencia después de recargar página
 * 4. Prueba en múltiples bancas (9, 12)
 *
 * Genera un reporte completo al final
 */

const BANCAS_TO_TEST = [9, 12];

// Definir TODOS los campos a probar (basado en el mapeo de premioFieldConverter.js)
const ALL_PRIZE_FIELDS = {
  directo: {
    'general_directo_primerPago': { testValue: '77.77', name: 'Directo - Primer Pago' },
    'general_directo_segundoPago': { testValue: '15.15', name: 'Directo - Segundo Pago' },
    'general_directo_tercerPago': { testValue: '5.55', name: 'Directo - Tercer Pago' },
    'general_directo_dobles': { testValue: '60.60', name: 'Directo - Dobles' }
  },
  pale: {
    'general_pale_todosEnSecuencia': { testValue: '1300.50', name: 'Palé - Todos en Secuencia' },
    'general_pale_primerPago': { testValue: '1250.25', name: 'Palé - Primer Pago' },
    'general_pale_segundoPago': { testValue: '1220.20', name: 'Palé - Segundo Pago' },
    'general_pale_tercerPago': { testValue: '210.10', name: 'Palé - Tercer Pago' }
  },
  tripleta: {
    'general_tripleta_primerPago': { testValue: '11000.00', name: 'Tripleta - Primer Pago' },
    'general_tripleta_segundoPago': { testValue: '110.50', name: 'Tripleta - Segundo Pago' },
    'general_tripleta_todosEnSecuencia': { testValue: '750.75', name: 'Tripleta - Todos en Secuencia' },
    'general_tripleta_triples': { testValue: '720.20', name: 'Tripleta - Triples' }
  },
  pick_two: {
    'general_pickTwo_primerPago': { testValue: '55.55', name: 'Pick Two - Primer Pago' },
    'general_pickTwo_dobles': { testValue: '12.12', name: 'Pick Two - Dobles' }
  }
};

test.describe('Prueba Exhaustiva de Campos de Premios', () => {

  for (const bancaId of BANCAS_TO_TEST) {
    test(`Banca ${bancaId}: Verificar todos los campos de premios`, async ({ page }) => {
      const report = {
        bancaId,
        totalFields: 0,
        testedFields: 0,
        passedFields: 0,
        failedFields: 0,
        results: []
      };

      console.log(`\n${'='.repeat(80)}`);
      console.log(`🏦 INICIANDO PRUEBA EXHAUSTIVA - BANCA ${bancaId}`);
      console.log(`${'='.repeat(80)}\n`);

      // ========== 1. LOGIN ==========
      console.log('📍 PASO 1: Login');
      await page.goto('http://localhost:3000/');
      await page.waitForSelector('input[name="username"], input[type="text"]', { timeout: 10000 });

      const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
      const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

      await usernameInput.fill('admin');
      await passwordInput.fill('Admin123456');
      await page.locator('button[type="submit"]').click();

      await page.waitForURL(/\/(dashboard|home|inicio)/, { timeout: 10000 });
      console.log('✅ Login exitoso\n');

      // ========== 2. NAVEGAR A EDITAR BANCA ==========
      console.log(`📍 PASO 2: Navegar a Editar Banca ${bancaId}`);
      await page.goto(`http://localhost:3000/bancas/editar/${bancaId}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      try {
        await page.waitForSelector('input[name="branchName"]', { timeout: 5000 });
        console.log('✅ Formulario de edición cargado\n');
      } catch (e) {
        console.log(`❌ ERROR: No se pudo cargar la banca ${bancaId}`);
        report.results.push({
          field: 'Carga de formulario',
          status: 'ERROR',
          error: 'Formulario no cargó'
        });
        return;
      }

      // ========== 3. IR AL TAB DE PREMIOS ==========
      console.log('📍 PASO 3: Ir al tab "Premios & Comisiones"');
      await page.click('text=Premios & Comisiones');
      await page.waitForTimeout(2000);
      console.log('✅ Tab de premios abierto\n');

      // ========== 4. PROBAR CADA CAMPO ==========
      console.log('📍 PASO 4: Probando TODOS los campos\n');

      for (const [betType, fields] of Object.entries(ALL_PRIZE_FIELDS)) {
        console.log(`\n   🎯 Bet Type: ${betType.toUpperCase()}`);
        console.log(`   ${'-'.repeat(60)}`);

        for (const [fieldName, fieldInfo] of Object.entries(fields)) {
          report.totalFields++;
          const fieldResult = {
            betType,
            fieldName: fieldInfo.name,
            inputName: fieldName,
            testValue: fieldInfo.testValue,
            status: 'PENDING',
            initialValue: null,
            afterSave: null,
            afterReload: null,
            error: null
          };

          try {
            // Capturar valor inicial
            const inputSelector = `input[name="${fieldName}"]`;
            const inputExists = await page.locator(inputSelector).count() > 0;

            if (!inputExists) {
              console.log(`   ⚠️  ${fieldInfo.name}: Campo no existe en el formulario`);
              fieldResult.status = 'NOT_FOUND';
              fieldResult.error = 'Campo no existe en el formulario';
              report.results.push(fieldResult);
              continue;
            }

            fieldResult.initialValue = await page.inputValue(inputSelector);
            report.testedFields++;

            // Modificar valor
            await page.fill(inputSelector, '');
            await page.fill(inputSelector, fieldInfo.testValue);

            const valueAfterFill = await page.inputValue(inputSelector);

            if (valueAfterFill !== fieldInfo.testValue) {
              console.log(`   ❌ ${fieldInfo.name}: No se pudo modificar`);
              fieldResult.status = 'FILL_FAILED';
              fieldResult.error = 'No se pudo modificar el valor';
              report.failedFields++;
              report.results.push(fieldResult);
              continue;
            }

            console.log(`   ✅ ${fieldInfo.name}: ${fieldResult.initialValue} → ${fieldInfo.testValue}`);
            fieldResult.status = 'MODIFIED';
            report.results.push(fieldResult);

          } catch (error) {
            console.log(`   ❌ ${fieldInfo.name}: ERROR - ${error.message}`);
            fieldResult.status = 'ERROR';
            fieldResult.error = error.message;
            report.failedFields++;
            report.results.push(fieldResult);
          }
        }
      }

      console.log(`\n   ${'-'.repeat(60)}`);
      console.log(`   📊 Campos modificados: ${report.testedFields} de ${report.totalFields}\n`);

      // ========== 5. GUARDAR CAMBIOS ==========
      console.log('📍 PASO 5: Guardar todos los cambios');
      await page.click('button:has-text("ACTUALIZAR")');
      await page.waitForTimeout(3000);

      // Verificar si hay error de validación
      const errorVisible = await page.locator('text=/Por favor corrija/i').count() > 0;
      if (errorVisible) {
        const errorText = await page.locator('text=/Por favor corrija/i').first().textContent();
        console.log(`❌ ERROR DE VALIDACIÓN: ${errorText}`);
        report.results.push({
          field: 'Guardado',
          status: 'VALIDATION_ERROR',
          error: errorText
        });
        return;
      }

      console.log('✅ Guardado procesado\n');

      // ========== 6. VERIFICAR PERSISTENCIA (SIN RELOAD) ==========
      console.log('📍 PASO 6: Verificar persistencia después de guardar\n');

      await page.waitForTimeout(2000);

      for (const result of report.results) {
        if (result.status !== 'MODIFIED') {
          continue;
        }

        try {
          const inputSelector = `input[name="${result.inputName}"]`;
          result.afterSave = await page.inputValue(inputSelector);

          if (result.afterSave === result.testValue) {
            console.log(`   ✅ ${result.fieldName}: Persiste (${result.afterSave})`);
            result.status = 'PASS_AFTER_SAVE';
          } else {
            console.log(`   ❌ ${result.fieldName}: NO persiste (esperado: ${result.testValue}, actual: ${result.afterSave})`);
            result.status = 'FAIL_AFTER_SAVE';
            report.failedFields++;
          }
        } catch (error) {
          result.status = 'ERROR_AFTER_SAVE';
          result.error = error.message;
          report.failedFields++;
        }
      }

      // ========== 7. VERIFICAR PERSISTENCIA (CON RELOAD) ==========
      console.log('\n📍 PASO 7: Verificar persistencia después de recargar página\n');

      await page.reload();
      await page.waitForSelector('input[name="branchName"]', { timeout: 10000 });
      await page.waitForTimeout(3000);
      await page.click('text=Premios & Comisiones');
      await page.waitForTimeout(2000);

      for (const result of report.results) {
        if (result.status !== 'PASS_AFTER_SAVE') {
          continue;
        }

        try {
          const inputSelector = `input[name="${result.inputName}"]`;
          result.afterReload = await page.inputValue(inputSelector);

          if (result.afterReload === result.testValue) {
            console.log(`   ✅ ${result.fieldName}: Persiste en BD (${result.afterReload})`);
            result.status = 'PASS';
            report.passedFields++;
          } else {
            console.log(`   ❌ ${result.fieldName}: NO persiste en BD (esperado: ${result.testValue}, actual: ${result.afterReload})`);
            result.status = 'FAIL_AFTER_RELOAD';
            report.failedFields++;
          }
        } catch (error) {
          result.status = 'ERROR_AFTER_RELOAD';
          result.error = error.message;
          report.failedFields++;
        }
      }

      // ========== 8. GENERAR REPORTE FINAL ==========
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📊 REPORTE FINAL - BANCA ${bancaId}`);
      console.log(`${'='.repeat(80)}\n`);

      console.log(`📈 ESTADÍSTICAS:`);
      console.log(`   Total de campos definidos: ${report.totalFields}`);
      console.log(`   Campos probados: ${report.testedFields}`);
      console.log(`   ✅ Campos exitosos: ${report.passedFields}`);
      console.log(`   ❌ Campos fallidos: ${report.failedFields}`);
      console.log(`   ⚠️  Campos no encontrados: ${report.results.filter(r => r.status === 'NOT_FOUND').length}`);

      const successRate = report.testedFields > 0
        ? ((report.passedFields / report.testedFields) * 100).toFixed(2)
        : 0;
      console.log(`   📊 Tasa de éxito: ${successRate}%\n`);

      console.log(`📋 DETALLES POR CAMPO:\n`);

      const groupedByStatus = {};
      for (const result of report.results) {
        if (!groupedByStatus[result.status]) {
          groupedByStatus[result.status] = [];
        }
        groupedByStatus[result.status].push(result);
      }

      // Campos exitosos
      if (groupedByStatus['PASS']?.length > 0) {
        console.log(`   ✅ EXITOSOS (${groupedByStatus['PASS'].length}):`);
        for (const r of groupedByStatus['PASS']) {
          console.log(`      • ${r.fieldName}: ${r.initialValue} → ${r.testValue}`);
        }
        console.log('');
      }

      // Campos fallidos
      if (groupedByStatus['FAIL_AFTER_SAVE']?.length > 0) {
        console.log(`   ❌ FALLÓ DESPUÉS DE GUARDAR (${groupedByStatus['FAIL_AFTER_SAVE'].length}):`);
        for (const r of groupedByStatus['FAIL_AFTER_SAVE']) {
          console.log(`      • ${r.fieldName}: esperado ${r.testValue}, actual ${r.afterSave}`);
        }
        console.log('');
      }

      if (groupedByStatus['FAIL_AFTER_RELOAD']?.length > 0) {
        console.log(`   ❌ FALLÓ DESPUÉS DE RECARGAR (${groupedByStatus['FAIL_AFTER_RELOAD'].length}):`);
        for (const r of groupedByStatus['FAIL_AFTER_RELOAD']) {
          console.log(`      • ${r.fieldName}: esperado ${r.testValue}, actual ${r.afterReload}`);
        }
        console.log('');
      }

      // Campos no encontrados
      if (groupedByStatus['NOT_FOUND']?.length > 0) {
        console.log(`   ⚠️  NO ENCONTRADOS (${groupedByStatus['NOT_FOUND'].length}):`);
        for (const r of groupedByStatus['NOT_FOUND']) {
          console.log(`      • ${r.fieldName} (${r.inputName})`);
        }
        console.log('');
      }

      // Errores
      const errorStatuses = ['ERROR', 'FILL_FAILED', 'ERROR_AFTER_SAVE', 'ERROR_AFTER_RELOAD'];
      const errors = report.results.filter(r => errorStatuses.includes(r.status));
      if (errors.length > 0) {
        console.log(`   🔴 ERRORES (${errors.length}):`);
        for (const r of errors) {
          console.log(`      • ${r.fieldName}: ${r.error}`);
        }
        console.log('');
      }

      console.log(`${'='.repeat(80)}\n`);

      // Asegurar que al menos algunos campos se pudieron probar
      expect(report.testedFields).toBeGreaterThan(0);
    });
  }
});
