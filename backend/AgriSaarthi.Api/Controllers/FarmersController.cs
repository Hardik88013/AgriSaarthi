using System.Threading.Tasks;
using AgriSaarthi.Api.DTOs;
using AgriSaarthi.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace AgriSaarthi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FarmersController : ControllerBase
    {
        private readonly IFarmerService _farmerService;

        public FarmersController(IFarmerService farmerService)
        {
            _farmerService = farmerService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFarmer(int id)
        {
            var farmer = await _farmerService.GetFarmerAsync(id);
            if (farmer == null) return NotFound(new { Message = "Farmer not found." });

            return Ok(farmer);
        }

        [HttpPost]
        public async Task<IActionResult> CreateFarmer([FromBody] FarmerCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var farmer = await _farmerService.CreateFarmerAsync(dto);
            return CreatedAtAction(nameof(GetFarmer), new { id = farmer.Id }, farmer);
        }

        [HttpGet("{id}/profile")]
        public async Task<IActionResult> GetFarmerProfile(int id)
        {
            // Verify farmer exists first
            var farmer = await _farmerService.GetFarmerAsync(id);
            if (farmer == null) return NotFound(new { Message = "Farmer not found." });

            var profile = await _farmerService.GetFarmerProfileAsync(id);
            if (profile == null) return NotFound(new { Message = "Profile not found for this farmer." });

            return Ok(profile);
        }

        [HttpPut("{id}/profile")]
        public async Task<IActionResult> UpdateFarmerProfile(int id, [FromBody] FarmerProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var farmer = await _farmerService.GetFarmerAsync(id);
            if (farmer == null) return NotFound(new { Message = "Farmer not found." });

            await _farmerService.UpdateFarmerProfileAsync(id, dto);

            return NoContent();
        }
    }
}
