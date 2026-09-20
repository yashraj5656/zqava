"use client";

import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import "./CompanionProfile.css";

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const EMPTY_WEEKLY_SCHEDULE = DAY_KEYS.map((day) => ({
  day,
  enabled: false,
  slots: [],
}));

const EMPTY_AVAILABILITY = {
  timezone: "Asia/Kolkata",
  weeklySchedule: EMPTY_WEEKLY_SCHEDULE,
};

function normalizeWeeklySchedule(schedule) {
  const source = Array.isArray(schedule) ? schedule : [];

  return DAY_KEYS.map((day) => {
    const found = source.find(
      (item) =>
        String(item?.day || "").toLowerCase() === day
    );

    const slots = Array.isArray(found?.slots)
      ? found.slots
          .filter(
            (slot) =>
              typeof slot?.start === "string" &&
              typeof slot?.end === "string" &&
              /^\d{2}:\d{2}$/.test(slot.start) &&
              /^\d{2}:\d{2}$/.test(slot.end) &&
              slot.start < slot.end
          )
          .map((slot) => ({
            start: slot.start,
            end: slot.end,
          }))
      : [];

    return {
      day,
      enabled: Boolean(found?.enabled),
      slots,
    };
  });
}

function generateHourlySlots(slots) {
  if (!Array.isArray(slots)) {
    return [];
  }

  const result = [];

  for (const slot of slots) {
    if (!slot?.start || !slot?.end) {
      continue;
    }

    const [startHour, startMinute] = slot.start
      .split(":")
      .map(Number);

    const [endHour, endMinute] = slot.end
      .split(":")
      .map(Number);

    if (
      Number.isNaN(startHour) ||
      Number.isNaN(startMinute) ||
      Number.isNaN(endHour) ||
      Number.isNaN(endMinute)
    ) {
      continue;
    }

    let currentMinutes =
      startHour * 60 + startMinute;

    const endMinutes =
      endHour * 60 + endMinute;

    while (currentMinutes + 60 <= endMinutes) {
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;

      result.push(
        `${String(hour).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}`
      );

      currentMinutes += 60;
    }
  }

  return [...new Set(result)].sort();
}

function formatTime(time) {
  if (!time) return "";

  const [hourString, minuteString] = time.split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return time;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(
    2,
    "0"
  )} ${suffix}`;
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function isSameDate(first, second) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export default function CompanionProfile({ companion }) {
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDuration, setSelectedDuration] =
    useState(1);

  const [availability, setAvailability] = useState(
    EMPTY_AVAILABILITY
  );

  const [availabilityLoading, setAvailabilityLoading] =
    useState(true);

  const [availabilityError, setAvailabilityError] =
    useState("");

  /*
   * ----------------------------------------------------
   * FETCH AVAILABILITY
   * ----------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      if (!companion?.id) {
        if (!cancelled) {
          setAvailabilityLoading(false);
          setAvailabilityError(
            "Companion information is missing."
          );
        }
        return;
      }

      try {
        setAvailabilityLoading(true);
        setAvailabilityError("");

        const response = await fetch(
          `/api/companion-availability?companionId=${encodeURIComponent(
            companion.id
          )}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to load availability."
          );
        }

        const normalized = {
          timezone:
            data?.availability?.timezone ||
            "Asia/Kolkata",

          weeklySchedule:
            normalizeWeeklySchedule(
              data?.availability?.weeklySchedule
            ),
        };

        if (!cancelled) {
          setAvailability(normalized);
        }
      } catch (error) {
        console.error(
          "Failed to load companion availability:",
          error
        );

        if (!cancelled) {
          setAvailability(
            EMPTY_AVAILABILITY
          );

          setAvailabilityError(
            error?.message ||
              "Unable to load availability."
          );
        }
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(false);
        }
      }
    }

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [companion?.id]);

  /*
   * ----------------------------------------------------
   * GET SCHEDULE FOR A DAY
   * ----------------------------------------------------
   */

  const getDaySchedule = (dayKey) => {
    return (
      availability?.weeklySchedule?.find(
        (item) => item.day === dayKey
      ) || {
        day: dayKey,
        enabled: false,
        slots: [],
      }
    );
  };

  /*
   * ----------------------------------------------------
   * BUILD NEXT 14 DAYS
   * ----------------------------------------------------
   */

  const dates = useMemo(() => {
    const result = [];
    const today = new Date();

    for (let index = 0; index < 14; index++) {
      const date = new Date(today);

      date.setDate(
        today.getDate() + index
      );

      const dayKey =
        DAY_KEYS[date.getDay()];

      const schedule =
        availability?.weeklySchedule?.find(
          (item) => item.day === dayKey
        );

      const hourlySlots = generateHourlySlots(
        schedule?.slots || []
      );

      result.push({
        date,
        dayKey,
        available:
          Boolean(schedule?.enabled) &&
          hourlySlots.length > 0,
        slots: hourlySlots,
      });
    }

    return result;
  }, [availability]);

  /*
   * ----------------------------------------------------
   * CURRENTLY SELECTED DATE
   * ----------------------------------------------------
   */

  const selectedDateData =
    dates[selectedDate] || null;

  /*
   * ----------------------------------------------------
   * AUTOMATICALLY SELECT FIRST AVAILABLE DATE
   * ----------------------------------------------------
   */

  useEffect(() => {
    if (!dates.length) {
      return;
    }

    const current =
      dates[selectedDate];

    if (current?.available) {
      return;
    }

    const firstAvailableIndex =
      dates.findIndex(
        (date) => date.available
      );

    if (firstAvailableIndex !== -1) {
      setSelectedDate(
        firstAvailableIndex
      );
    }
  }, [dates, selectedDate]);

  /*
   * ----------------------------------------------------
   * AVAILABLE TIMES FOR SELECTED DATE
   * ----------------------------------------------------
   */

  const timeSlots = useMemo(() => {
    if (!selectedDateData) {
      return [];
    }

    let slots = [
      ...selectedDateData.slots,
    ];

    /*
     * Remove times that have already passed
     * when the selected date is today.
     */
    if (
      isSameDate(
        selectedDateData.date,
        new Date()
      )
    ) {
      const now = new Date();

      const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

      slots = slots.filter((time) => {
        const [hour, minute] =
          time.split(":").map(Number);

        const slotMinutes =
          hour * 60 + minute;

        return (
          slotMinutes > currentMinutes
        );
      });
    }

    return slots;
  }, [selectedDateData]);

  /*
   * ----------------------------------------------------
   * RESET TIME WHEN DATE CHANGES
   * ----------------------------------------------------
   */

  useEffect(() => {
    if (
      selectedTime &&
      !timeSlots.includes(selectedTime)
    ) {
      setSelectedTime("");
      setSelectedDuration(1);
    }
  }, [timeSlots, selectedTime]);

  /*
   * ----------------------------------------------------
   * DURATION OPTIONS
   * ----------------------------------------------------
   */

  const durationOptions = useMemo(() => {
    if (!selectedTime) {
      return [1];
    }

    const startIndex =
      timeSlots.indexOf(selectedTime);

    if (startIndex === -1) {
      return [1];
    }

    const options = [];

    for (let duration = 1; duration <= 3; duration++) {
      let valid = true;

      for (
        let offset = 0;
        offset < duration;
        offset++
      ) {
        if (
          !timeSlots[startIndex + offset]
        ) {
          valid = false;
          break;
        }
      }

      if (valid) {
        options.push(duration);
      }
    }

    return options.length ? options : [1];
  }, [selectedTime, timeSlots]);

  /*
   * ----------------------------------------------------
   * KEEP DURATION VALID
   * ----------------------------------------------------
   */

  useEffect(() => {
    if (
      !durationOptions.includes(
        selectedDuration
      )
    ) {
      setSelectedDuration(
        durationOptions[0] || 1
      );
    }
  }, [
    durationOptions,
    selectedDuration,
  ]);

  const requireLogin = () => {
    const token = document.cookie
      .split("; ")
      .find((row) =>
        row.startsWith("zqava_session=")
      );
  
    if (!token) {
      window.location.href =
        `/signup?redirect=${encodeURIComponent(
          window.location.pathname +
          window.location.search
        )}`;
  
      return false;
    }
  
    return true;
  };

  /*
   * ----------------------------------------------------
   * BOOKING
   * ----------------------------------------------------
   */

  const handleBooking = () => {
   // if (!requireLogin()) {
   //   return;
    //}
    if (!companion?.id) {
      alert(
        "Companion information is missing."
      );
      return;
    }

    /*
     * IMPORTANT:
     *
     * Do NOT check companion.available here.
     *
     * Weekly availability from the dashboard
     * is the source of truth.
     */

    if (!selectedDateData?.available) {
      alert(
        "Please choose an available date."
      );
      return;
    }

    if (!selectedTime) {
      alert(
        "Please choose a time first."
      );
      return;
    }

    if (
      !durationOptions.includes(
        selectedDuration
      )
    ) {
      alert(
        "The selected duration is no longer available."
      );
      return;
    }

    const params = new URLSearchParams({
      companionId: companion.id,
      date: selectedDateData.date
        .toISOString()
        .split("T")[0],
      time: selectedTime,
      duration: String(
        selectedDuration
      ),
    });

    window.location.href =
      `/booking?${params.toString()}`;
  };

  /*
   * ----------------------------------------------------
   * OTHER EXISTING PROFILE DATA
   * ----------------------------------------------------
   */

  const pageTitle =
    companion?.name
      ? `${companion.name} | ZQAVA`
      : "Companion | ZQAVA";

  const hasAvailableDate = dates.some(
    (date) => date.available
  );

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <main className="companion-profile-page">
        {/* ==================================================
            PROFILE HEADER
        ================================================== */}

        <section className="profile-header">
          <div className="profile-header-inner">
            <Link
              href="/explore"
              className="back-link"
            >
              ← Back to companions
            </Link>

            <div className="profile-main">
              <div className="profile-photo-wrapper">
                {companion?.profilePhoto ? (
                  <img
                    src={companion.profilePhoto}
                    alt={
                      companion?.name ||
                      "Companion"
                    }
                    className="profile-photo"
                  />
                ) : (
                  <div className="profile-photo-placeholder">
                    {(
                      companion?.name ||
                      "C"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>

              <div className="profile-info">
                <div className="profile-name-row">
                  <h1>
                    {companion?.name ||
                      "Companion"}
                  </h1>

                  {companion?.verified && (
                    <span className="verified-badge">
                      ✓ Verified
                    </span>
                  )}
                </div>

                {companion?.city && (
                  <p className="profile-location">
                    📍 {companion.city}
                  </p>
                )}

                {companion?.age && (
                  <p className="profile-age">
                    {companion.age} years old
                  </p>
                )}

                {companion?.bio && (
                  <p className="profile-bio">
                    {companion.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <section className="profile-content">
          <div className="profile-content-grid">
            {/* ==================================================
                LEFT COLUMN
            ================================================== */}

            <div className="profile-details">
              {companion?.interests?.length >
                0 && (
                <section className="profile-section">
                  <h2>Interests</h2>

                  <div className="tag-list">
                    {companion.interests.map(
                      (interest) => (
                        <span
                          key={interest}
                          className="tag"
                        >
                          {interest}
                        </span>
                      )
                    )}
                  </div>
                </section>
              )}

              {companion
                ?.companionshipStyles
                ?.length > 0 && (
                <section className="profile-section">
                  <h2>
                    Companionship style
                  </h2>

                  <div className="tag-list">
                    {companion.companionshipStyles.map(
                      (style) => (
                        <span
                          key={style}
                          className="tag"
                        >
                          {style}
                        </span>
                      )
                    )}
                  </div>
                </section>
              )}

              {/* ==================================================
                  AVAILABILITY INFORMATION
              ================================================== */}

              <section className="profile-section">
                <h2>Availability</h2>

                {availabilityLoading ? (
                  <div className="availability-loading">
                    Loading availability...
                  </div>
                ) : availabilityError ? (
                  <div className="availability-error">
                    {availabilityError}
                  </div>
                ) : (
                  <div className="weekly-availability">
                    {availability.weeklySchedule.map(
                      (day) => (
                        <div
                          key={day.day}
                          className={`weekly-day ${
                            day.enabled &&
                            day.slots.length
                              ? "available"
                              : "unavailable"
                          }`}
                        >
                          <span className="weekly-day-name">
                            {day.day
                              .charAt(0)
                              .toUpperCase() +
                              day.day.slice(
                                1
                              )}
                          </span>

                          <span className="weekly-day-times">
                            {day.enabled &&
                            day.slots.length
                              ? day.slots
                                  .map(
                                    (
                                      slot
                                    ) =>
                                      `${formatTime(
                                        slot.start
                                      )} – ${formatTime(
                                        slot.end
                                      )}`
                                  )
                                  .join(
                                    ", "
                                  )
                              : "Unavailable"}
                          </span>
                        </div>
                      )
                    )}

                    <p className="availability-timezone">
                      Timezone:{" "}
                      {
                        availability.timezone
                      }
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* ==================================================
                BOOKING SIDEBAR
            ================================================== */}

            <aside className="booking-sidebar">
              <div className="booking-card">
                <div className="booking-price">
                  <strong>
                    ₹
                    {companion?.hourlyRate ||
                      0}
                  </strong>
                  <span>/ hour</span>
                </div>

                <div className="booking-divider" />

                <div className="booking-section">
                  <h3>
                    Choose a date
                  </h3>

                  {availabilityLoading ? (
                    <div className="booking-loading">
                      Loading dates...
                    </div>
                  ) : (
                    <>
                      <div className="date-grid">
                        {dates.map(
                          (
                            date,
                            index
                          ) => (
                            <button
                              type="button"
                              key={`${date.dayKey}-${date.date.toISOString()}`}
                              className={`date-button ${
                                selectedDate ===
                                index
                                  ? "selected"
                                  : ""
                              } ${
                                !date.available
                                  ? "disabled"
                                  : ""
                              }`}
                              disabled={
                                !date.available
                              }
                              onClick={() => {
                                setSelectedDate(
                                  index
                                );
                                setSelectedTime(
                                  ""
                                );
                                setSelectedDuration(
                                  1
                                );
                              }}
                            >
                              <span>
                                {date.date.toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday:
                                      "short",
                                  }
                                )}
                              </span>

                              <strong>
                                {date.date.getDate()}
                              </strong>

                              <small>
                                {date.date.toLocaleDateString(
                                  "en-US",
                                  {
                                    month:
                                      "short",
                                  }
                                )}
                              </small>
                            </button>
                          )
                        )}
                      </div>

                      {!hasAvailableDate && (
                        <div className="booking-unavailable">
                          This companion has no
                          available dates for
                          booking.
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="booking-section">
                  <h3>
                    Choose a time
                  </h3>

                  {!availabilityLoading &&
                  selectedDateData?.available &&
                  timeSlots.length > 0 ? (
                    <div className="time-grid">
                      {timeSlots.map(
                        (time) => (
                          <button
                            type="button"
                            key={time}
                            className={`time-button ${
                              selectedTime ===
                              time
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedTime(
                                time
                              );
                              setSelectedDuration(
                                1
                              );
                            }}
                          >
                            {formatTime(
                              time
                            )}
                          </button>
                        )
                      )}
                    </div>
                  ) : (
                    !availabilityLoading && (
                      <div className="booking-empty">
                        {selectedDateData?.available
                          ? "No times available for this date."
                          : "Select an available date."}
                      </div>
                    )
                  )}
                </div>

                <div className="booking-section">
                  <h3>
                    Duration
                  </h3>

                  <div className="duration-grid">
                    {durationOptions.map(
                      (duration) => (
                        <button
                          type="button"
                          key={duration}
                          className={`duration-button ${
                            selectedDuration ===
                            duration
                              ? "selected"
                              : ""
                          }`}
                          disabled={
                            !selectedTime
                          }
                          onClick={() =>
                            setSelectedDuration(
                              duration
                            )
                          }
                        >
                          {duration}{" "}
                          {duration === 1
                            ? "hour"
                            : "hours"}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="booking-submit"
                  disabled={
                    !selectedDateData?.available ||
                    !selectedTime ||
                    availabilityLoading
                  }
                  onClick={
                    handleBooking
                  }
                >
                  {availabilityLoading
                    ? "Loading availability..."
                    : !selectedDateData?.available
                    ? "Choose an available date"
                    : !selectedTime
                    ? "Choose a time"
                    : "Continue to booking"}
                </button>

                <p className="booking-note">
                  You’ll review the booking
                  details before payment.
                </p>
              </div>
            </aside>
          </div>
        </section>

        {/* ==================================================
            MOBILE BOOKING BAR
        ================================================== */}

       {/* <div className="mobile-book-bar">
          <div className="mobile-book-price">
            <strong>
              ₹
              {companion?.hourlyRate ||
                0}
            </strong>
            <span>/ hour</span>
          </div>

          <button
            type="button"
            onClick={() => {
              document
                .querySelector(
                  ".booking-sidebar"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
            }}
          >
            {`Book ${
              companion?.name ||
              "Companion"
            }`}
            <span>→</span>
          </button>
        </div>*/}
      </main>
    </>
  );
}