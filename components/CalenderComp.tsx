import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";

const { width } = Dimensions.get("window");

interface ICalendarComp {
  handleSelectedDate: any;
  selectedDate: string;
}

const CalendarComp = ({ handleSelectedDate, selectedDate }: ICalendarComp) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // Start from current month
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // Start from current year
  const [today, setToday] = useState(new Date());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getDaysArray = () => {
    const days = daysInMonth(currentMonth, currentYear);
    const firstDay = firstDayOfMonth(currentMonth, currentYear);

    const daysArray = [];
    for (let i = 0; i < firstDay; i++) {
      daysArray.push("");
    }
    for (let i = 1; i <= days; i++) {
      daysArray.push(i);
    }
    return daysArray;
  };

  const daysArray = getDaysArray();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isPastDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const todayWithoutTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return date.getTime() < todayWithoutTime.getTime();
  };

  useEffect(() => {
    setToday(new Date());
  }, [currentMonth, currentYear]);

  return (
    <View>
      <View style={styles.topHeader}>
        <Text style={styles.topHeaderTitle}>Select Date</Text>
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrevMonth}>
            <Ionicons name="chevron-back" size={18} color={"#ccc"} />
          </TouchableOpacity>
          <Text style={styles.month}>{months[currentMonth]}</Text>
          <TouchableOpacity onPress={handleNextMonth}>
            <Ionicons name="chevron-forward" size={18} color={"#071827"} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.daysOfWeek}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day, index) => (
              <Text key={index} style={styles.dayOfWeek}>
                {day}
              </Text>
            )
          )}
        </View>

        <View style={styles.calendarGrid}>
          {daysArray.map((getDay: any, index) => {
            const day = getDay;
            const currentDay: any = new Date(
              currentYear,
              currentMonth,
              day
            )?.toString();

            const isPast = day && isPastDate(day);

            return (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.day,
                  pressed && { opacity: 0.5 },
                  {
                    backgroundColor:
                      selectedDate?.toString() === currentDay && day
                        ? "#FF3B4A"
                        : "",
                  },
                  isPast && styles.pastDay, // Apply past day style
                ]}
                onPress={() => {
                  !isPast &&
                    day &&
                    handleSelectedDate(
                      new Date(currentYear, currentMonth, day)
                    );
                }} // Disable past days
                disabled={isPast ? true : false} // Disable past days
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color:
                        selectedDate?.toString() === currentDay
                          ? "white"
                          : isPast
                          ? "#ccc" // Gray out past days
                          : "#353535",
                    },
                  ]}
                >
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    width: width * 0.9,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  arrow: {
    color: "#071827",
    fontSize: 20,
  },
  month: {
    color: "#071827",
    fontSize: 14,
  },
  daysOfWeek: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  dayOfWeek: {
    color: "#353535",
    width: (width * 0.8) / 7,
    textAlign: "center",
    fontSize: 12,
    fontFamily: "DMSansSemiBold",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  day: {
    width: (width * 0.8) / 7,
    height: (width * 0.8) / 7,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    color: "#353535",
    fontSize: 16,
    fontFamily: "DMSansSemiBold",
  },
  pastDay: {
    opacity: 0.5, // Gray out past days
  },
  topHeader: {
    backgroundColor: "white",
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  topHeaderTitle: {
    textAlign: "center",
    borderBottomWidth: 0.5,
    borderColor: "#A0B1C0",
    paddingBottom: 10,
    marginBottom: 10,
    fontSize: 14,
    color: "#071827",
    fontFamily: "DMSansSemiBold",
  },
});

export default CalendarComp;
