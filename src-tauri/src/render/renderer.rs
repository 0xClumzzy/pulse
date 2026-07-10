use wgpu::{Device, Queue, RenderPass, Color, CommandEncoder};
use std::sync::Arc;

/// Main renderer coordinating frame rendering
pub struct Renderer {
    pub device: Arc<Device>,
    pub queue: Arc<Queue>,
    clear_color: Color,
}

impl Renderer {
    pub fn new(device: Arc<Device>, queue: Arc<Queue>) -> Self {
        Self {
            device,
            queue,
            clear_color: Color {
                r: 0.1,
                g: 0.1,
                b: 0.1,
                a: 1.0,
            },
        }
    }

    pub fn set_clear_color(&mut self, r: f64, g: f64, b: f64, a: f64) {
        self.clear_color = Color { r, g, b, a };
    }

    pub fn render_frame(&self, surface_texture: &wgpu::SurfaceTexture) -> Result<(), String> {
        let view = surface_texture
            .texture
            .create_view(&wgpu::TextureViewDescriptor::default());

        let mut encoder = self.device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
            label: Some("Render Encoder"),
        });

        {
            let _render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("Render Pass"),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &view,
                    resolve_target: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(self.clear_color),
                        store: wgpu::StoreOp::Store,
                    },
                })],
                depth_stencil_attachment: None,
                occlusion_query_set: None,
                timestamp_writes: None,
            });
        }

        self.queue.submit(std::iter::once(encoder.finish()));
        surface_texture.present();

        Ok(())
    }
}
