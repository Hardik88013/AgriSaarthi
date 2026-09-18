using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriSaarthi.Api.Models
{
    public class FarmerProfile
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int FarmerId { get; set; }

        [ForeignKey("FarmerId")]
        public Farmer? Farmer { get; set; }

        [MaxLength(200)]
        public string? Location { get; set; }

        [MaxLength(100)]
        public string? State { get; set; }

        [MaxLength(100)]
        public string? District { get; set; }

        public double? FarmSize { get; set; } // in hectares or acres

        [MaxLength(100)]
        public string? SoilType { get; set; }

        [MaxLength(100)]
        public string? IrrigationType { get; set; }

        [MaxLength(100)]
        public string? PrimaryCrop { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
