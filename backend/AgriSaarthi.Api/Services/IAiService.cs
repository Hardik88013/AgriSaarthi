using System.Threading.Tasks;
using AgriSaarthi.Api.DTOs;

namespace AgriSaarthi.Api.Services
{
    public interface IAiService
    {
        Task<CropRecommendationResponseDto> GetCropRecommendationAsync(CropRecommendationRequestDto request);
    }
}
