using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using AgriSaarthi.Api.Services;

namespace AgriSaarthi.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WeatherController : ControllerBase
    {
        private readonly IWeatherService _weatherService;

        public WeatherController(IWeatherService weatherService)
        {
            _weatherService = weatherService;
        }

        [HttpGet]
        public async Task<IActionResult> GetWeather()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int farmerId))
            {
                return Unauthorized();
            }

            var weatherData = await _weatherService.GetWeatherForFarmerAsync(farmerId);
            
            if (weatherData == null)
            {
                return NotFound(new { message = "Location unavailable or weather data not found. Please complete your farmer profile location." });
            }

            return Ok(weatherData);
        }
    }
}
