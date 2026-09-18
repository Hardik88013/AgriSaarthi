using System.Threading.Tasks;
using AgriSaarthi.Api.DTOs;

namespace AgriSaarthi.Api.Services
{
    public interface IWeatherService
    {
        Task<WeatherResponseDto?> GetWeatherForFarmerAsync(int farmerId);
    }
}
