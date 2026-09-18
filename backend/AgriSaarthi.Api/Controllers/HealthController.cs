using Microsoft.AspNetCore.Mvc;

namespace AgriSaarthi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                Status = "Healthy",
                Service = "AgriSaarthi.Api",
                Timestamp = DateTime.UtcNow
            });
        }
    }
}
