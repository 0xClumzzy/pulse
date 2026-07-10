use winit::{
    event::{Event, WindowEvent},
    event_loop::{EventLoop, ControlFlow},
    window::WindowBuilder,
};
use wgpu::Device;
use std::sync::Arc;
use pollster::FutureExt;

mod render;

use render::{Renderer, Surface};

pub async fn run_render_loop() -> Result<(), String> {
    env_logger::init();

    let event_loop = EventLoop::new().map_err(|e| format!("Failed to create event loop: {}", e))?;
    
    let window = WindowBuilder::new()
        .with_title("Pulse Terminal")
        .with_inner_size(winit::dpi::LogicalSize::new(1200.0, 800.0))
        .build(&event_loop)
        .map_err(|e| format!("Failed to create window: {}", e))?;

    let window = Arc::new(window);
    let mut surface = Surface::new(window.clone()).await?;
    let mut renderer = Renderer::new(surface.device.clone(), surface.queue.clone());

    let mut last_render_time = std::time::Instant::now();

    event_loop
        .run(move |event, target| {
            match event {
                Event::WindowEvent {
                    ref event,
                    window_id,
                } if window_id == window.id() => match event {
                    WindowEvent::Resized(physical_size) => {
                        surface.resize(physical_size.width, physical_size.height);
                        window.request_redraw();
                    }
                    WindowEvent::CloseRequested => {
                        target.exit();
                    }
                    _ => {}
                },
                Event::AboutToWait => {
                    window.request_redraw();
                }
                Event::WindowEvent {
                    event: WindowEvent::RedrawRequested,
                    window_id,
                } if window_id == window.id() => {
                    let now = std::time::Instant::now();
                    let delta = now.duration_since(last_render_time);
                    last_render_time = now;

                    match surface.get_current_texture() {
                        Ok(output) => {
                            if let Err(e) = renderer.render_frame(&output) {
                                log::error!("Render error: {}", e);
                            }
                        }
                        Err(e) => {
                            log::error!("Surface texture error: {}", e);
                        }
                    }
                }
                _ => {}
            }
        })
        .map_err(|e| format!("Event loop error: {}", e))
}
