fn main() {
    env_logger::init();
    pollster::block_on(pulse::run_render_loop())
        .expect("Failed to run render loop");
}
