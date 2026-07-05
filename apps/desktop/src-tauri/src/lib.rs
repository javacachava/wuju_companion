// Fase 4: OCR local vía CLI de sistema (tesseract), no un binding en Rust.
// Requiere el paquete `tesseract-ocr` instalado en el sistema (ver README de esta app).
// Solo se llama on-demand, nunca en loop — ver DESKTOP-MIGRATION-PLAN.md sección 5.3:
// esto es el fallback para texto de UI general. Para código, el frontend prefiere
// el portapapeles (tauri-plugin-clipboard-manager) antes de llegar acá.
#[tauri::command]
fn ocr_screenshot(path: String) -> Result<String, String> {
    let output = std::process::Command::new("tesseract")
        .arg(&path)
        .arg("stdout")
        .output()
        .map_err(|err| format!("tesseract_not_available: {err}"))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("tesseract_failed: {stderr}"));
    }

    String::from_utf8(output.stdout).map_err(|err| format!("tesseract_invalid_output: {err}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_mic_recorder::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_screenshots::init())
        .invoke_handler(tauri::generate_handler![ocr_screenshot])
        .run(tauri::generate_context!())
        .expect("error while running El Compañero desktop");
}
