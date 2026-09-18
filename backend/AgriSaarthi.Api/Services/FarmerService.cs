using System;
using System.Threading.Tasks;
using AgriSaarthi.Api.Data;
using AgriSaarthi.Api.DTOs;
using AgriSaarthi.Api.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace AgriSaarthi.Api.Services
{
    public class FarmerService : IFarmerService
    {
        private readonly AgriSaarthiDbContext _context;

        public FarmerService(AgriSaarthiDbContext context)
        {
            _context = context;
        }

        public async Task<FarmerResponseDto?> GetFarmerAsync(int id)
        {
            var farmer = await _context.Farmers.FindAsync(id);
            if (farmer == null) return null;

            return new FarmerResponseDto
            {
                Id = farmer.Id,
                FullName = farmer.FullName,
                Email = farmer.Email,
                PhoneNumber = farmer.PhoneNumber,
                CreatedAt = farmer.CreatedAt
            };
        }

        public async Task<FarmerResponseDto> CreateFarmerAsync(FarmerCreateDto dto)
        {
            var farmer = new Farmer
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            _context.Farmers.Add(farmer);
            await _context.SaveChangesAsync();

            return new FarmerResponseDto
            {
                Id = farmer.Id,
                FullName = farmer.FullName,
                Email = farmer.Email,
                PhoneNumber = farmer.PhoneNumber,
                CreatedAt = farmer.CreatedAt
            };
        }

        public async Task<FarmerProfileDto?> GetFarmerProfileAsync(int farmerId)
        {
            var profile = await _context.FarmerProfiles
                .FirstOrDefaultAsync(p => p.FarmerId == farmerId);

            if (profile == null) return null;

            return new FarmerProfileDto
            {
                Location = profile.Location,
                State = profile.State,
                District = profile.District,
                FarmSize = profile.FarmSize,
                SoilType = profile.SoilType,
                IrrigationType = profile.IrrigationType,
                PrimaryCrop = profile.PrimaryCrop
            };
        }

        public async Task<bool> UpdateFarmerProfileAsync(int farmerId, FarmerProfileDto dto)
        {
            var profile = await _context.FarmerProfiles
                .FirstOrDefaultAsync(p => p.FarmerId == farmerId);

            if (profile == null)
            {
                profile = new FarmerProfile
                {
                    FarmerId = farmerId
                };
                _context.FarmerProfiles.Add(profile);
            }

            profile.Location = dto.Location;
            profile.State = dto.State;
            profile.District = dto.District;
            profile.FarmSize = dto.FarmSize;
            profile.SoilType = dto.SoilType;
            profile.IrrigationType = dto.IrrigationType;
            profile.PrimaryCrop = dto.PrimaryCrop;
            profile.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
