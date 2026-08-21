using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;

namespace Requestrr.WebApi.RequestrrBot
{
    public class BlockedAttempt
    {
        public string Username { get; set; }
        public DateTime AtUtc { get; set; }
    }

    public class PauseStateData
    {
        public bool IsPaused { get; set; }
        public string Reason { get; set; }
        public DateTime? PausedAtUtc { get; set; }
        public DateTime? AutoResumeAtUtc { get; set; }
        public List<BlockedAttempt> BlockedAttempts { get; set; } = new List<BlockedAttempt>();
    }

    // On/off switch for new requests, checked by every request command.
    // Persisted to a JSON file in the config folder so it survives container restarts.
    // Supports an optional reason (shown to users who get blocked) and an optional
    // auto-resume time (so a pause started for a known window, e.g. "back at 9pm",
    // clears itself automatically without anyone needing to remember to flip it back).
    public static class RequestPauseState
    {
        private static string FilePath => Path.Combine(SettingsFile.SettingsFolder, "requests_pause_state.json");
        private const int MaxBlockedAttemptsStored = 100;

        private static PauseStateData Load()
        {
            if (!File.Exists(FilePath))
            {
                return new PauseStateData();
            }

            try
            {
                var json = File.ReadAllText(FilePath);
                var data = JsonConvert.DeserializeObject<PauseStateData>(json) ?? new PauseStateData();

                // Auto-resume: if a resume time was set and it has passed, clear the pause.
                if (data.IsPaused && data.AutoResumeAtUtc.HasValue && DateTime.UtcNow >= data.AutoResumeAtUtc.Value)
                {
                    data.IsPaused = false;
                    data.Reason = null;
                    data.PausedAtUtc = null;
                    data.AutoResumeAtUtc = null;
                    Save(data);
                }

                return data;
            }
            catch
            {
                // If the file is somehow corrupt, fail safe to "not paused" rather than
                // accidentally blocking every request forever.
                return new PauseStateData();
            }
        }

        private static void Save(PauseStateData data)
        {
            File.WriteAllText(FilePath, JsonConvert.SerializeObject(data, Formatting.Indented));
        }

        public static bool IsPaused => Load().IsPaused;

        public static string Reason => Load().Reason;

        public static DateTime? AutoResumeAtUtc => Load().AutoResumeAtUtc;

        public static PauseStateData GetStatus() => Load();

        // Simple on/off with no reason or timer, used by the Discord /togglerequests command.
        public static void SetPaused(bool paused)
        {
            var data = Load();
            data.IsPaused = paused;

            if (paused)
            {
                data.PausedAtUtc = DateTime.UtcNow;
            }
            else
            {
                data.Reason = null;
                data.PausedAtUtc = null;
                data.AutoResumeAtUtc = null;
            }

            Save(data);
        }

        // Richer pause used by the web dashboard: optional reason shown to blocked users,
        // and an optional auto-resume time so the pause lifts itself.
        public static void Pause(string reason, DateTime? autoResumeAtUtc)
        {
            var data = Load();
            data.IsPaused = true;
            data.Reason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim();
            data.PausedAtUtc = DateTime.UtcNow;
            data.AutoResumeAtUtc = autoResumeAtUtc;
            Save(data);
        }

        public static void Resume()
        {
            SetPaused(false);
        }

        public static void LogBlockedAttempt(string username)
        {
            var data = Load();
            data.BlockedAttempts.Insert(0, new BlockedAttempt { Username = username, AtUtc = DateTime.UtcNow });

            if (data.BlockedAttempts.Count > MaxBlockedAttemptsStored)
            {
                data.BlockedAttempts = data.BlockedAttempts.Take(MaxBlockedAttemptsStored).ToList();
            }

            Save(data);
        }

        public static void ClearBlockedAttempts()
        {
            var data = Load();
            data.BlockedAttempts.Clear();
            Save(data);
        }
    }
}
