using System;
using System.Threading.Tasks;
using AgriSaarthi.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AgriSaarthi.Api.Controllers
{
    [Route("api/market-prices")]
    [ApiController]
    [Authorize]
    public class MarketPricesController : ControllerBase
    {
        private readonly IMarketPriceService _marketPriceService;
        private readonly ILogger<MarketPricesController> _logger;

        public MarketPricesController(IMarketPriceService marketPriceService, ILogger<MarketPricesController> logger)
        {
            _marketPriceService = marketPriceService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string? crop, [FromQuery] string? state)
        {
            try
            {
                var prices = await _marketPriceService.GetMarketPricesAsync(crop, state);
                if (prices == null || prices.Count == 0)
                {
                    return NotFound(new { message = "No reference market prices found for the given criteria." });
                }
                return Ok(prices);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching market prices");
                return StatusCode(500, new { error = "An unexpected error occurred while fetching market prices." });
            }
        }
    }
}
