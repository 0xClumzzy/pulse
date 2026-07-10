use wgpu::{Device, Queue, Surface, SurfaceConfiguration, TextureFormat};
use winit::window::Window;
use std::sync::Arc;

/// Manages the wgpu surface and device lifecycle
pub struct Surface {
    pub surface: wgpu::Surface<'static>,
    pub device: Arc<Device>,
    pub queue: Arc<Queue>,
    pub config: SurfaceConfiguration,
    pub format: TextureFormat,
}

impl Surface {
    pub async fn new(window: Arc<Window>) -> Result<Self, String> {
        let instance = wgpu::Instance::new(wgpu::InstanceDescriptor {
            backends: wgpu::Backends::VULKAN | wgpu::Backends::GL,
            ..Default::default()
        });

        let surface = unsafe {
            instance.create_surface_unsafe(
                wgpu::SurfaceTargetUnsafe::from_window(&window)
            )
        }.map_err(|e| format!("Failed to create surface: {}", e))?;

        let adapter = instance
            .request_adapter(&wgpu::RequestAdapterOptions {
                power_preference: wgpu::PowerPreference::HighPerformance,
                compatible_surface: Some(&surface),
                force_fallback: false,
            })
            .await
            .ok_or("Failed to find a suitable GPU adapter")?;

        log::info!("GPU adapter: {:?}", adapter.get_info());

        let (device, queue) = adapter
            .request_device(
                &wgpu::DeviceDescriptor {
                    label: Some("Pulse Device"),
                    required_features: wgpu::Features::empty(),
                    required_limits: wgpu::Limits::default(),
                },
                None,
            )
            .await
            .map_err(|e| format!("Failed to request device: {}", e))?;

        let surface_caps = surface.get_capabilities(&adapter);
        let format = surface_caps
            .formats
            .iter()
            .copied()
            .find(|f| !f.is_srgb())
            .or_else(|| surface_caps.formats.first().copied())
            .ok_or("No supported surface formats")?;

        let size = window.inner_size();
        let config = SurfaceConfiguration {
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
            format,
            width: size.width.max(1),
            height: size.height.max(1),
            present_mode: wgpu::PresentMode::AutoVsync,
            alpha_mode: surface_caps.alpha_modes[0],
            view_formats: vec![],
            desired_maximum_frame_latency: 2,
        };

        surface.configure(&device, &config);

        Ok(Self {
            surface,
            device: Arc::new(device),
            queue: Arc::new(queue),
            config,
            format,
        })
    }

    pub fn resize(&mut self, width: u32, height: u32) {
        if width > 0 && height > 0 {
            self.config.width = width;
            self.config.height = height;
            self.surface.configure(&self.device, &self.config);
            log::debug!("Surface resized to {}x{}", width, height);
        }
    }

    pub fn get_current_texture(&self) -> Result<wgpu::SurfaceTexture, String> {
        self.surface
            .get_current_texture()
            .map_err(|e| format!("Failed to get surface texture: {}", e))
    }
}
