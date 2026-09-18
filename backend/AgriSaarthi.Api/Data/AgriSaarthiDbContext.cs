using AgriSaarthi.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AgriSaarthi.Api.Data
{
    public class AgriSaarthiDbContext : DbContext
    {
        public AgriSaarthiDbContext(DbContextOptions<AgriSaarthiDbContext> options) : base(options)
        {
        }

        public DbSet<Farmer> Farmers { get; set; }
        public DbSet<FarmerProfile> FarmerProfiles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure One-to-One relationship
            modelBuilder.Entity<Farmer>()
                .HasOne(f => f.Profile)
                .WithOne(p => p.Farmer)
                .HasForeignKey<FarmerProfile>(p => p.FarmerId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Ensure unique email and phone
            modelBuilder.Entity<Farmer>()
                .HasIndex(f => f.Email)
                .IsUnique();
                
            modelBuilder.Entity<Farmer>()
                .HasIndex(f => f.PhoneNumber)
                .IsUnique();
        }
    }
}
