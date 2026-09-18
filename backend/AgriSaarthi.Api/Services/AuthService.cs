using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AgriSaarthi.Api.Data;
using AgriSaarthi.Api.DTOs;
using AgriSaarthi.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace AgriSaarthi.Api.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto);
        Task<bool> EmailExistsAsync(string email);
    }

    public class AuthService : IAuthService
    {
        private readonly AgriSaarthiDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AgriSaarthiDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var farmer = await _context.Farmers.FirstOrDefaultAsync(f => f.Email == loginDto.Email);
            
            if (farmer == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, farmer.PasswordHash))
            {
                return null;
            }

            var token = GenerateJwtToken(farmer);

            return new AuthResponseDto
            {
                Token = token,
                FarmerId = farmer.Id,
                FullName = farmer.FullName,
                Email = farmer.Email
            };
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto)
        {
            if (await EmailExistsAsync(registerDto.Email))
            {
                throw new InvalidOperationException("Email is already registered.");
            }

            var farmer = new Farmer
            {
                FullName = registerDto.FullName,
                Email = registerDto.Email,
                PhoneNumber = registerDto.PhoneNumber,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password)
            };

            _context.Farmers.Add(farmer);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(farmer);

            return new AuthResponseDto
            {
                Token = token,
                FarmerId = farmer.Id,
                FullName = farmer.FullName,
                Email = farmer.Email
            };
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.Farmers.AnyAsync(f => f.Email == email);
        }

        private string GenerateJwtToken(Farmer farmer)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, farmer.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, farmer.Email),
                new Claim(ClaimTypes.NameIdentifier, farmer.Id.ToString()),
                new Claim(ClaimTypes.Name, farmer.FullName)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
