using System;
using System.Threading.Tasks;
using AgriSaarthi.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AgriSaarthi.Api.Controllers
{
    [Route("api/farming-tips")]
    [ApiController]
    [Authorize]
    public class FarmingTipsController : ControllerBase
    {
        private readonly IFarmingTipsService _farmingTipsService;
        private readonly ILogger<FarmingTipsController> _logger;

        public FarmingTipsController(IFarmingTipsService farmingTipsService, ILogger<FarmingTipsController> logger)
        {
            _farmingTipsService = farmingTipsService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string? crop, [FromQuery] string? category)
        {
            try
            {
                var tips = await _farmingTipsService.GetFarmingTipsAsync(crop, category);
                if (tips == null || tips.Count == 0)
                {
                    return NotFound(new { message = "No farming tips found for the given criteria." });
                }
                return Ok(tips);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching farming tips");
                return StatusCode(500, new { error = "An unexpected error occurred while fetching farming tips." });
            }
        }
    }
}
