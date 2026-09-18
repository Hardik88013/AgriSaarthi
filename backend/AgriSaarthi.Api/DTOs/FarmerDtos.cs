using System;

namespace AgriSaarthi.Api.DTOs
{
    public class FarmerCreateDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class FarmerResponseDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class FarmerProfileDto
    {
        public string? Location { get; set; }
        public string? State { get; set; }
        public string? District { get; set; }
        public double? FarmSize { get; set; }
        public string? SoilType { get; set; }
        public string? IrrigationType { get; set; }
        public string? PrimaryCrop { get; set; }
    }
}
