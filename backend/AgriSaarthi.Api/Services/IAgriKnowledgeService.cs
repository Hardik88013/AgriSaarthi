using System.Collections.Generic;
using System.Threading.Tasks;
using AgriSaarthi.Api.DTOs;

namespace AgriSaarthi.Api.Services
{
    public interface IAgriKnowledgeService
    {
        Task<List<CropDto>> GetCropsAsync();
        Task<List<DiseaseDto>> GetDiseasesAsync(string cropId = null);
        Task<List<PestDto>> GetPestsAsync(string cropId = null);
        Task<DiseaseDto> GetDiseaseByIdAsync(string id);
        Task<PestDto> GetPestByIdAsync(string id);
        Task<AdvisoryResponseDto> GetWeatherAdvisoryAsync(int farmerId);
    }
}
