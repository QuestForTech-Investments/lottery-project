using Microsoft.EntityFrameworkCore;
using LotteryApi.Models;
using LotteryApi.Models.Enums;

namespace LotteryApi.Data;

public class LotteryDbContext : DbContext
{
    public LotteryDbContext(DbContextOptions<LotteryDbContext> options) : base(options)
    {
    }

    // Master Tables
    public DbSet<Country> Countries { get; set; }
    public DbSet<Zone> Zones { get; set; }
    public DbSet<Bank> Banks { get; set; }
    public DbSet<Lottery> Lotteries { get; set; }
    public DbSet<Draw> Draws { get; set; }
    public DbSet<DrawWeeklySchedule> DrawWeeklySchedules { get; set; }

    // Game System
    public DbSet<GameCategory> GameCategories { get; set; }
    public DbSet<GameType> GameTypes { get; set; }
    public DbSet<LotteryGameCompatibility> LotteryGameCompatibilities { get; set; }
    public DbSet<LotteryBetTypeCompatibility> LotteryBetTypeCompatibilities { get; set; }
    public DbSet<DrawGameCompatibility> DrawGameCompatibilities { get; set; }
    public DbSet<DrawBetTypeCompatibility> DrawBetTypeCompatibilities { get; set; }

    // Results
    public DbSet<Result> Results { get; set; }
    public DbSet<ResultLog> ResultLogs { get; set; }

    // User and Permissions
    public DbSet<Role> Roles { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<RolePermission> RolePermissions { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<UserPermission> UserPermissions { get; set; }

    // Betting Pools
    public DbSet<BettingPool> BettingPools { get; set; }
    public DbSet<Balance> Balances { get; set; }
    public DbSet<BettingPoolConfig> BettingPoolConfigs { get; set; }
    public DbSet<BettingPoolPrintConfig> BettingPoolPrintConfigs { get; set; }
    public DbSet<BettingPoolDiscountConfig> BettingPoolDiscountConfigs { get; set; }
    public DbSet<BettingPoolFooter> BettingPoolFooters { get; set; }
    public DbSet<BettingPoolPrizesCommission> BettingPoolPrizesCommissions { get; set; }
    public DbSet<BettingPoolSchedule> BettingPoolSchedules { get; set; }
    public DbSet<BettingPoolSortition> BettingPoolSortitions { get; set; }  // DEPRECATED: Use BettingPoolDraws
    public DbSet<BettingPoolDraw> BettingPoolDraws { get; set; }
    public DbSet<BettingPoolDrawGameType> BettingPoolDrawGameTypes { get; set; }
    public DbSet<BettingPoolStyle> BettingPoolStyles { get; set; }
    public DbSet<BettingPoolAutomaticExpense> BettingPoolAutomaticExpenses { get; set; }

    // N:M Relationships
    public DbSet<UserBettingPool> UserBettingPools { get; set; }
    public DbSet<UserZone> UserZones { get; set; }

    // Tickets
    public DbSet<Ticket> Tickets { get; set; }
    public DbSet<TicketLine> TicketLines { get; set; }

    // Prizes
    public DbSet<Prize> Prizes { get; set; }

    // Bet Types and Prize Types
    public DbSet<BetType> BetTypes { get; set; }
    public DbSet<PrizeType> PrizeTypes { get; set; }
    public DbSet<BancaPrizeConfig> BancaPrizeConfigs { get; set; }
    public DbSet<DrawPrizeConfig> DrawPrizeConfigs { get; set; }

    // Login Sessions (Audit)
    public DbSet<LoginSession> LoginSessions { get; set; }

    // Limits
    public DbSet<LimitRule> LimitRules { get; set; }
    public DbSet<LimitConsumption> LimitConsumptions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure tables with triggers
        ConfigureTriggers(modelBuilder);

        // Configure indexes
        ConfigureIndexes(modelBuilder);

        // Configure unique constraints
        ConfigureUniqueConstraints(modelBuilder);

        // Configure relationships
        ConfigureRelationships(modelBuilder);
    }

    private void ConfigureTriggers(ModelBuilder modelBuilder)
    {
        // Configure tables that have database triggers
        // This tells EF Core to avoid using OUTPUT clause which conflicts with triggers
        modelBuilder.Entity<UserPermission>()
            .ToTable(tb => tb.HasTrigger("trg_update_user_permissions"))
            .ToTable(tb => tb.UseSqlOutputClause(false));

        modelBuilder.Entity<User>()
            .ToTable(tb => tb.HasTrigger("trg_update_users"))
            .ToTable(tb => tb.UseSqlOutputClause(false));

        modelBuilder.Entity<Ticket>()
            .ToTable(tb => tb.HasTrigger("trg_update_tickets"))
            .ToTable(tb => tb.UseSqlOutputClause(false));

        modelBuilder.Entity<TicketLine>()
            .ToTable(tb => tb.HasTrigger("trg_update_ticket_lines"))
            .ToTable(tb => tb.UseSqlOutputClause(false));

        modelBuilder.Entity<LoginSession>()
            .ToTable(tb => tb.HasTrigger("trg_update_login_sessions"))
            .ToTable(tb => tb.UseSqlOutputClause(false));
    }

    private void ConfigureIndexes(ModelBuilder modelBuilder)
    {
        // Tickets indexes
        modelBuilder.Entity<Ticket>()
            .HasIndex(t => new { t.BettingPoolId, t.CreatedAt });

        modelBuilder.Entity<Ticket>()
            .HasIndex(t => new { t.UserId, t.CreatedAt });

        modelBuilder.Entity<Ticket>()
            .HasIndex(t => new { t.Status, t.CreatedAt });

        modelBuilder.Entity<Ticket>()
            .HasIndex(t => t.Barcode)
            .HasFilter("[barcode] IS NOT NULL");

        // TicketLines indexes
        modelBuilder.Entity<TicketLine>()
            .HasIndex(tl => new { tl.TicketId, tl.LineNumber });

        // Índices sin LotteryId (se obtiene de Draw)
        modelBuilder.Entity<TicketLine>()
            .HasIndex(tl => new { tl.DrawId, tl.CreatedAt });

        modelBuilder.Entity<TicketLine>()
            .HasIndex(tl => new { tl.BetNumber, tl.DrawId, tl.DrawDate });

        modelBuilder.Entity<TicketLine>()
            .HasIndex(tl => new { tl.LineStatus, tl.CreatedAt });

        modelBuilder.Entity<TicketLine>()
            .HasIndex(tl => new { tl.IsWinner, tl.PrizeAmount })
            .HasFilter("[is_winner] = 1");

        // User indexes
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .HasFilter("[email] IS NOT NULL");

        // Draw indexes for Results optimization
        modelBuilder.Entity<Draw>()
            .HasIndex(d => new { d.IsActive, d.DrawTime, d.DrawName });

        modelBuilder.Entity<Draw>()
            .HasIndex(d => new { d.IsActive, d.UseWeeklySchedule });

        // DrawWeeklySchedule indexes for efficient day-of-week filtering
        modelBuilder.Entity<DrawWeeklySchedule>()
            .HasIndex(dws => new { dws.DrawId, dws.DayOfWeek, dws.IsActive });

        // Result indexes for date-based queries
        modelBuilder.Entity<Result>()
            .HasIndex(r => new { r.ResultDate, r.DrawId });

        modelBuilder.Entity<Result>()
            .HasIndex(r => r.DrawId);
    }

    private void ConfigureUniqueConstraints(ModelBuilder modelBuilder)
    {
        // Already configured via attributes, but can add additional ones here if needed
        modelBuilder.Entity<LotteryGameCompatibility>()
            .HasIndex(lgc => new { lgc.LotteryId, lgc.GameTypeId })
            .IsUnique();

        modelBuilder.Entity<DrawGameCompatibility>()
            .HasIndex(dgc => new { dgc.DrawId, dgc.GameTypeId })
            .IsUnique();

        modelBuilder.Entity<DrawBetTypeCompatibility>()
            .HasIndex(dbc => new { dbc.DrawId, dbc.BetTypeId })
            .IsUnique();

        modelBuilder.Entity<BettingPoolSchedule>()
            .HasIndex(bps => new { bps.BettingPoolId, bps.DayOfWeek })
            .IsUnique();

        modelBuilder.Entity<BettingPoolPrizesCommission>()
            .HasIndex(bpc => new { bpc.BettingPoolId, bpc.LotteryId, bpc.GameType })
            .IsUnique();

        modelBuilder.Entity<BettingPoolSortition>()
            .HasIndex(bps => new { bps.BettingPoolId, bps.SortitionType })
            .IsUnique();

        modelBuilder.Entity<UserBettingPool>()
            .HasIndex(ubp => new { ubp.UserId, ubp.BettingPoolId })
            .IsUnique();

        modelBuilder.Entity<UserZone>()
            .HasIndex(uz => new { uz.UserId, uz.ZoneId })
            .IsUnique();

        modelBuilder.Entity<UserPermission>()
            .HasIndex(up => new { up.UserId, up.PermissionId })
            .IsUnique();

        modelBuilder.Entity<RolePermission>()
            .HasIndex(rp => new { rp.RoleId, rp.PermissionId })
            .IsUnique();

        modelBuilder.Entity<BettingPoolDraw>()
            .HasIndex(bpd => new { bpd.BettingPoolId, bpd.DrawId })
            .IsUnique();

        modelBuilder.Entity<BettingPoolDrawGameType>()
            .HasIndex(bpdgt => new { bpdgt.BettingPoolId, bpdgt.DrawId, bpdgt.GameTypeId })
            .IsUnique();
    }

    private void ConfigureRelationships(ModelBuilder modelBuilder)
    {
        // Disable cascade delete for most relationships to prevent accidental data loss

        // Countries -> Lotteries
        modelBuilder.Entity<Lottery>()
            .HasOne(l => l.Country)
            .WithMany(c => c.Lotteries)
            .HasForeignKey(l => l.CountryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Countries -> Zones
        modelBuilder.Entity<Zone>()
            .HasOne(z => z.Country)
            .WithMany(c => c.Zones)
            .HasForeignKey(z => z.CountryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Lotteries -> Draws
        modelBuilder.Entity<Draw>()
            .HasOne(d => d.Lottery)
            .WithMany(l => l.Draws)
            .HasForeignKey(d => d.LotteryId)
            .OnDelete(DeleteBehavior.Restrict);

        // BettingPool -> Zone
        modelBuilder.Entity<BettingPool>()
            .HasOne(bp => bp.Zone)
            .WithMany(z => z.BettingPools)
            .HasForeignKey(bp => bp.ZoneId)
            .OnDelete(DeleteBehavior.Restrict);

        // BettingPool -> Bank
        modelBuilder.Entity<BettingPool>()
            .HasOne(bp => bp.Bank)
            .WithMany(b => b.BettingPools)
            .HasForeignKey(bp => bp.BankId)
            .OnDelete(DeleteBehavior.SetNull);

        // BettingPool -> Balance (1:1)
        modelBuilder.Entity<Balance>()
            .HasOne(b => b.BettingPool)
            .WithOne(bp => bp.Balance)
            .HasForeignKey<Balance>(b => b.BettingPoolId)
            .OnDelete(DeleteBehavior.Cascade);

        // BettingPool -> Config (1:1)
        modelBuilder.Entity<BettingPoolConfig>()
            .HasOne(bpc => bpc.BettingPool)
            .WithOne(bp => bp.Config)
            .HasForeignKey<BettingPoolConfig>(bpc => bpc.BettingPoolId)
            .OnDelete(DeleteBehavior.Cascade);

        // BettingPool -> PrintConfig (1:1)
        modelBuilder.Entity<BettingPoolPrintConfig>()
            .HasOne(bppc => bppc.BettingPool)
            .WithOne(bp => bp.PrintConfig)
            .HasForeignKey<BettingPoolPrintConfig>(bppc => bppc.BettingPoolId)
            .OnDelete(DeleteBehavior.Cascade);

        // BettingPool -> DiscountConfig (1:1)
        modelBuilder.Entity<BettingPoolDiscountConfig>()
            .HasOne(bpdc => bpdc.BettingPool)
            .WithOne(bp => bp.DiscountConfig)
            .HasForeignKey<BettingPoolDiscountConfig>(bpdc => bpdc.BettingPoolId)
            .OnDelete(DeleteBehavior.Cascade);

        // BettingPool -> Footer (1:1)
        modelBuilder.Entity<BettingPoolFooter>()
            .HasOne(bpf => bpf.BettingPool)
            .WithOne(bp => bp.Footer)
            .HasForeignKey<BettingPoolFooter>(bpf => bpf.BettingPoolId)
            .OnDelete(DeleteBehavior.Cascade);

        // BettingPool -> Style (1:1)
        modelBuilder.Entity<BettingPoolStyle>()
            .HasOne(bps => bps.BettingPool)
            .WithOne(bp => bp.Style)
            .HasForeignKey<BettingPoolStyle>(bps => bps.BettingPoolId)
            .OnDelete(DeleteBehavior.Cascade);

        // Ticket -> BettingPool
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.BettingPool)
            .WithMany(bp => bp.Tickets)
            .HasForeignKey(t => t.BettingPoolId)
            .OnDelete(DeleteBehavior.Restrict);

        // Ticket -> User
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.User)
            .WithMany(u => u.Tickets)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // TicketLine -> Ticket
        modelBuilder.Entity<TicketLine>()
            .HasOne(tl => tl.Ticket)
            .WithMany(t => t.TicketLines)
            .HasForeignKey(tl => tl.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        // User -> Role
        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.SetNull);

        // GameType -> GameCategory
        modelBuilder.Entity<GameType>()
            .HasOne(gt => gt.Category)
            .WithMany(gc => gc.GameTypes)
            .HasForeignKey(gt => gt.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // LimitRule configuration
        modelBuilder.Entity<LimitRule>(entity =>
        {
            // Configure LimitType enum conversion
            entity.Property(e => e.LimitType)
                .HasConversion<int>()
                .HasDefaultValue(LimitType.GeneralForGroup);

            // LimitRule -> Lottery
            entity.HasOne(lr => lr.Lottery)
                .WithMany()
                .HasForeignKey(lr => lr.LotteryId)
                .OnDelete(DeleteBehavior.Restrict);

            // LimitRule -> Draw
            entity.HasOne(lr => lr.Draw)
                .WithMany(d => d.LimitRules)
                .HasForeignKey(lr => lr.DrawId)
                .OnDelete(DeleteBehavior.Restrict);

            // LimitRule -> GameType
            entity.HasOne(lr => lr.GameType)
                .WithMany()
                .HasForeignKey(lr => lr.GameTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // LimitRule -> Zone
            entity.HasOne(lr => lr.Zone)
                .WithMany()
                .HasForeignKey(lr => lr.ZoneId)
                .OnDelete(DeleteBehavior.Restrict);

            // LimitRule -> BettingPool
            entity.HasOne(lr => lr.BettingPool)
                .WithMany()
                .HasForeignKey(lr => lr.BettingPoolId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // LimitConsumption -> LimitRule
        modelBuilder.Entity<LimitConsumption>()
            .HasOne(lc => lc.LimitRule)
            .WithMany(lr => lr.LimitConsumptions)
            .HasForeignKey(lc => lc.LimitRuleId)
            .OnDelete(DeleteBehavior.Restrict);

        // LimitConsumption -> Draw
        modelBuilder.Entity<LimitConsumption>()
            .HasOne(lc => lc.Draw)
            .WithMany(d => d.LimitConsumptions)
            .HasForeignKey(lc => lc.DrawId)
            .OnDelete(DeleteBehavior.Restrict);

        // LimitConsumption -> BettingPool
        modelBuilder.Entity<LimitConsumption>()
            .HasOne(lc => lc.BettingPool)
            .WithMany()
            .HasForeignKey(lc => lc.BettingPoolId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
