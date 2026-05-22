namespace LotteryApi.Exceptions;

/// <summary>
/// Stable, language-agnostic error codes emitted in the API response.
///
/// Convention:
///   - SCREAMING_SNAKE_CASE
///   - Prefix with the domain (USER_, BETTING_POOL_, LIMIT_, LOAN_, …) so codes
///     stay self-describing without needing context.
///   - Generic / cross-cutting codes have no prefix (NOT_FOUND, DUPLICATE_RESOURCE,
///     UNAUTHORIZED, BAD_REQUEST, CONFLICT, INTERNAL_ERROR, DB_*).
///
/// Adding a code: drop it here and add the matching entry under `apiErrors`
/// in all four locale files (frontend-v4/src/i18n/locales/{es,en,fr,ht}.json).
/// The frontend resolves unknown codes to the backend's Spanish `detail` field,
/// so a missing translation degrades gracefully rather than breaking.
/// </summary>
public static class ErrorCodes
{
    // Generic / cross-cutting
    public const string NotFound = "NOT_FOUND";
    public const string DuplicateResource = "DUPLICATE_RESOURCE";
    public const string Unauthorized = "UNAUTHORIZED";
    public const string Forbidden = "FORBIDDEN";
    public const string BadRequest = "BAD_REQUEST";
    public const string Conflict = "CONFLICT";
    public const string ValidationFailed = "VALIDATION_FAILED";
    public const string InternalError = "INTERNAL_ERROR";

    // Database
    public const string DbUniqueConstraint = "DB_UNIQUE_CONSTRAINT";
    public const string DbForeignKeyInUse = "DB_FK_IN_USE";
    public const string DbMissingRequired = "DB_MISSING_REQUIRED";
    public const string DbTimeout = "DB_TIMEOUT";
    public const string DbGeneric = "DB_GENERIC";

    // Auth / users
    public const string InvalidCredentials = "INVALID_CREDENTIALS";
    public const string InvalidPin = "INVALID_PIN";
    public const string AccountBlocked = "ACCOUNT_BLOCKED";
    public const string SessionExpired = "SESSION_EXPIRED";
    public const string PasswordChangeRequired = "PASSWORD_CHANGE_REQUIRED";
    public const string PinChangeRequired = "PIN_CHANGE_REQUIRED";
    public const string TokenInvalid = "TOKEN_INVALID";
    public const string UserNotFound = "USER_NOT_FOUND";
    public const string UserAlreadyExists = "USER_ALREADY_EXISTS";
    public const string PasswordTooWeak = "PASSWORD_TOO_WEAK";
    public const string PasswordMismatch = "PASSWORD_MISMATCH";
    public const string OldPasswordIncorrect = "OLD_PASSWORD_INCORRECT";
    public const string PermissionDenied = "PERMISSION_DENIED";

    // Betting pools
    public const string BettingPoolNotFound = "BETTING_POOL_NOT_FOUND";
    public const string BettingPoolCodeExists = "BETTING_POOL_CODE_EXISTS";
    public const string BettingPoolHasPendingTickets = "BETTING_POOL_HAS_PENDING_TICKETS";
    public const string BettingPoolDisabled = "BETTING_POOL_DISABLED";
    public const string BettingPoolHasUsers = "BETTING_POOL_HAS_USERS";
    public const string BankNotFound = "BANK_NOT_FOUND";
    public const string PosRoleNotFound = "POS_ROLE_NOT_FOUND";
    public const string UserNotAssignedToPool = "USER_NOT_ASSIGNED_TO_POOL";
    public const string PrizeCommissionNotFound = "PRIZE_COMMISSION_NOT_FOUND";
    public const string PrizeCommissionExists = "PRIZE_COMMISSION_EXISTS";
    public const string PrizeConfigRequired = "PRIZE_CONFIG_REQUIRED";
    public const string DrawAlreadyConfigured = "DRAW_ALREADY_CONFIGURED";
    public const string BetTypeNotFound = "BET_TYPE_NOT_FOUND";
    public const string UsernameRequired = "USERNAME_REQUIRED";
    public const string PasswordRequired = "PASSWORD_REQUIRED";
    public const string IpNotFound = "IP_NOT_FOUND";

    // Zones
    public const string ZoneNotFound = "ZONE_NOT_FOUND";
    public const string ZoneHasBettingPools = "ZONE_HAS_BETTING_POOLS";

    // Draws / lotteries
    public const string DrawNotFound = "DRAW_NOT_FOUND";
    public const string LotteryNotFound = "LOTTERY_NOT_FOUND";
    public const string GameTypeNotFound = "GAME_TYPE_NOT_FOUND";
    public const string DrawClosed = "DRAW_CLOSED";
    public const string DrawAlreadyHasResults = "DRAW_ALREADY_HAS_RESULTS";

    // Tickets
    public const string TicketNotFound = "TICKET_NOT_FOUND";
    public const string TicketAlreadyPaid = "TICKET_ALREADY_PAID";
    public const string TicketCancelWindowExpired = "TICKET_CANCEL_WINDOW_EXPIRED";
    public const string TicketNotWinner = "TICKET_NOT_WINNER";
    public const string PlayInvalid = "PLAY_INVALID";
    public const string PlayAmountTooLow = "PLAY_AMOUNT_TOO_LOW";
    public const string PlayAmountTooHigh = "PLAY_AMOUNT_TOO_HIGH";
    public const string PlayLimitExceeded = "PLAY_LIMIT_EXCEEDED";

    // Limits
    public const string LimitNotFound = "LIMIT_NOT_FOUND";
    public const string LimitTypeInvalid = "LIMIT_TYPE_INVALID";
    public const string LimitMissingNumber = "LIMIT_MISSING_NUMBER";
    public const string LimitGlobalRequiredFirst = "LIMIT_GLOBAL_REQUIRED_FIRST";
    public const string LimitZoneRequiredFirst = "LIMIT_ZONE_REQUIRED_FIRST";

    // Loans
    public const string LoanNotFound = "LOAN_NOT_FOUND";
    public const string LoanNotActive = "LOAN_NOT_ACTIVE";
    public const string LoanOnlyActiveEditable = "LOAN_ONLY_ACTIVE_EDITABLE";
    public const string LoanOnlyActiveCancellable = "LOAN_ONLY_ACTIVE_CANCELLABLE";

    // Accountable entities / transactions
    public const string EntityNotFound = "ENTITY_NOT_FOUND";
    public const string EntityCodeExists = "ENTITY_CODE_EXISTS";
    public const string TransactionNotFound = "TRANSACTION_NOT_FOUND";
    public const string TransactionGroupNotFound = "TRANSACTION_GROUP_NOT_FOUND";
    public const string TransactionLineInvalid = "TRANSACTION_LINE_INVALID";
    public const string TransactionAmountMismatch = "TRANSACTION_AMOUNT_MISMATCH";

    // Blocked numbers / hot numbers
    public const string BlockedNumberNotFound = "BLOCKED_NUMBER_NOT_FOUND";
    public const string AtLeastOneNumberRequired = "AT_LEAST_ONE_NUMBER_REQUIRED";

    // Schedules
    public const string ScheduleConflict = "SCHEDULE_CONFLICT";
    public const string ScheduleNotFound = "SCHEDULE_NOT_FOUND";

    // Expense categories
    public const string ExpenseCategoryNotFound = "EXPENSE_CATEGORY_NOT_FOUND";
    public const string ExpenseCategoryNameExists = "EXPENSE_CATEGORY_NAME_EXISTS";
    public const string ExpenseParentInvalid = "EXPENSE_PARENT_INVALID";

    // Hot numbers
    public const string HotNumberLimitNotFound = "HOT_NUMBER_LIMIT_NOT_FOUND";
    public const string HotNumberDrawsInvalid = "HOT_NUMBER_DRAWS_INVALID";
    public const string HotNumberLimitDuplicate = "HOT_NUMBER_LIMIT_DUPLICATE";

    // Contacts
    public const string ContactNotFound = "CONTACT_NOT_FOUND";

    // Banca / draw prize config
    public const string BancaConfigNotFound = "BANCA_CONFIG_NOT_FOUND";
    public const string PrizeConfigEmpty = "PRIZE_CONFIG_EMPTY";

    // Group config
    public const string GroupManagePermissionDenied = "GROUP_MANAGE_PERMISSION_DENIED";
    public const string GroupConfigEmpty = "GROUP_CONFIG_EMPTY";

    // Additional limits codes
    public const string LimitDrawInvalid = "LIMIT_DRAW_INVALID";
    public const string LimitGameTypeInvalid = "LIMIT_GAME_TYPE_INVALID";
    public const string LimitLotteryInvalid = "LIMIT_LOTTERY_INVALID";
    public const string LimitZoneInvalid = "LIMIT_ZONE_INVALID";
    public const string LimitBettingPoolInvalid = "LIMIT_BETTING_POOL_INVALID";
    public const string LimitParentViolation = "LIMIT_PARENT_VIOLATION";
    public const string LimitBancaLocalConflict = "LIMIT_BANCA_LOCAL_CONFLICT";
    public const string LimitAmountNotFound = "LIMIT_AMOUNT_NOT_FOUND";
    public const string LimitNoResults = "LIMIT_NO_RESULTS";
    public const string ReservationNotFound = "RESERVATION_NOT_FOUND";

    // Common/cross-cutting (batch C additions)
    public const string InvalidDateRange = "INVALID_DATE_RANGE";
    public const string CountryNotFound = "COUNTRY_NOT_FOUND";
    public const string ResultNotFound = "RESULT_NOT_FOUND";
    public const string SorteoOverrideNotFound = "SORTEO_OVERRIDE_NOT_FOUND";
    public const string InvalidWinningNumber = "INVALID_WINNING_NUMBER";
    public const string CategoryNotSupported = "CATEGORY_NOT_SUPPORTED";
    public const string GameTypeCodesRequired = "GAME_TYPE_CODES_REQUIRED";

    // Notifications
    public const string NotificationMessageRequired = "NOTIFICATION_MESSAGE_REQUIRED";
    public const string NotificationRecipientsRequired = "NOTIFICATION_RECIPIENTS_REQUIRED";
    public const string NotificationBancaRecipientsRequired = "NOTIFICATION_BANCA_RECIPIENTS_REQUIRED";
    public const string NotificationAdminRecipientsRequired = "NOTIFICATION_ADMIN_RECIPIENTS_REQUIRED";
    public const string NotificationExpirationRequired = "NOTIFICATION_EXPIRATION_REQUIRED";
    public const string NotificationNotFound = "NOTIFICATION_NOT_FOUND";
    public const string UserNotAssociatedToBanca = "USER_NOT_ASSOCIATED_TO_BANCA";

    // Users / passwords
    public const string LanguageInvalid = "LANGUAGE_INVALID";
    public const string PasswordSameAsOld = "PASSWORD_SAME_AS_OLD";
    public const string PasswordTooShort = "PASSWORD_TOO_SHORT";
    public const string PermissionCodeExists = "PERMISSION_CODE_EXISTS";
    public const string UsersNotFound = "USERS_NOT_FOUND";
    public const string UserNotInZone = "USER_NOT_IN_ZONE";

    // Tickets
    public const string BettingPoolNotActive = "BETTING_POOL_NOT_ACTIVE";
    public const string UserNotActive = "USER_NOT_ACTIVE";
    public const string TicketSellBancaDenied = "TICKET_SELL_BANCA_DENIED";
    public const string TicketDatePastForbidden = "TICKET_DATE_PAST_FORBIDDEN";
    public const string TicketDateFutureForbidden = "TICKET_DATE_FUTURE_FORBIDDEN";
    public const string TicketFutureSalesDisabled = "TICKET_FUTURE_SALES_DISABLED";
    public const string TicketFutureWeekLimit = "TICKET_FUTURE_WEEK_LIMIT";
    public const string TicketFutureDaysLimit = "TICKET_FUTURE_DAYS_LIMIT";
    public const string TicketPreviousDayDenied = "TICKET_PREVIOUS_DAY_DENIED";
    public const string TicketInvalidBetsExceedLimits = "TICKET_INVALID_BETS_EXCEED_LIMITS";
    public const string TicketAlreadyCancelled = "TICKET_ALREADY_CANCELLED";
    public const string TicketCancelPaidDenied = "TICKET_CANCEL_PAID_DENIED";
    public const string TicketPayCancelledDenied = "TICKET_PAY_CANCELLED_DENIED";
    public const string TicketHasNoPrize = "TICKET_HAS_NO_PRIZE";

    // Transactions
    public const string TransactionApprovePermissionDenied = "TRANSACTION_APPROVE_PERMISSION_DENIED";
    public const string TransactionRejectPermissionDenied = "TRANSACTION_REJECT_PERMISSION_DENIED";
    public const string TransactionGroupInvalidStateDelete = "TRANSACTION_GROUP_INVALID_STATE_DELETE";
    public const string TransactionGroupInvalidStateApprove = "TRANSACTION_GROUP_INVALID_STATE_APPROVE";
    public const string TransactionGroupInvalidStateReject = "TRANSACTION_GROUP_INVALID_STATE_REJECT";
    public const string TransactionBettingPoolRequired = "TRANSACTION_BETTING_POOL_REQUIRED";
}
