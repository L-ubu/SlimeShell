mod commands;
mod db;
mod models;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // File system commands
            commands::fs::read_file,
            commands::fs::write_file,
            commands::fs::delete_file,
            commands::fs::list_dir,
            commands::fs::create_dir,
            commands::fs::file_exists,
            // Terminal commands
            commands::terminal::spawn_terminal,
            commands::terminal::write_terminal,
            commands::terminal::resize_terminal,
            commands::terminal::kill_terminal,
            commands::terminal::list_terminals,
            // VPN commands
            commands::vpn::connect_vpn,
            commands::vpn::disconnect_vpn,
            commands::vpn::vpn_status,
            // Network commands
            commands::network::ping_host,
            commands::network::get_tun0_ip,
            commands::network::parse_nmap_xml,
            // Flipper Zero commands
            commands::flipper::list_serial_ports,
            commands::flipper::serial_read,
            commands::flipper::serial_write,
            // OSINT commands
            commands::osint::shodan_search,
            commands::osint::shodan_host,
            commands::osint::whois_lookup,
            commands::osint::dns_enum,
            // System commands
            commands::system::get_system_info,
            commands::system::open_external_url,
            // Database commands
            db::get_ctfs,
            db::save_ctf,
            db::get_profile,
            db::update_profile,
            db::add_xp,
            db::get_setting,
            db::set_setting,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
