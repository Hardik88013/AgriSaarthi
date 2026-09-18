using System.Collections.Generic;
using System.Threading.Tasks;
using AgriSaarthi.Api.DTOs;

namespace AgriSaarthi.Api.Services
{
    public interface IFarmingTipsService
    {
        Task<List<FarmingTipDto>> GetFarmingTipsAsync(string? crop = null, string? category = null);
    }
}
