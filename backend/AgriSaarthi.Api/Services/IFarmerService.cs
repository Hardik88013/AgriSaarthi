using System.Threading.Tasks;
using AgriSaarthi.Api.DTOs;

namespace AgriSaarthi.Api.Services
{
    public interface IFarmerService
    {
        Task<FarmerResponseDto?> GetFarmerAsync(int id);
        Task<FarmerResponseDto> CreateFarmerAsync(FarmerCreateDto dto);
        Task<FarmerProfileDto?> GetFarmerProfileAsync(int farmerId);
        Task<bool> UpdateFarmerProfileAsync(int farmerId, FarmerProfileDto dto);
    }
}
