import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { isIOS } from "@/src/theme/platform";

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  icon?: React.ReactNode;
  error?: string;
  success?: string;
  keyboardType?: "default" | "email-address" | "number-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  editable?: boolean;
  rightElement?: React.ReactNode;
  onRightPress?: () => void;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  icon,
  error,
  success,
  keyboardType = "default",
  autoCapitalize = "none",
  editable = true,
  rightElement,
  onRightPress,
}: InputProps) {
  const { colors, radius, isDark } = useAppTheme();

  const inputBorder = isIOS
    ? isDark
      ? "rgba(255,255,255,0.15)"
      : "rgba(60,60,67,0.15)"
    : "rgba(0,94,164,0.2)";

  const inputBg = isIOS
    ? isDark
      ? "rgba(255,255,255,0.08)"
      : "rgba(255,255,255,0.5)"
    : isDark
      ? "rgba(255,255,255,0.08)"
      : "rgba(255,255,255,0.8)";

  const borderColor = error
    ? colors.error
    : success
      ? colors.primary
      : inputBorder;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textTertiary }]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputRow,
          {
            borderRadius: radius.button,
            borderColor,
            backgroundColor: inputBg,
          },
        ]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
        />
        {rightElement && (
          <TouchableOpacity onPress={onRightPress} style={styles.rightBtn}>
            {rightElement}
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text style={[styles.feedback, { color: colors.error }]}>{error}</Text>
      ) : null}
      {success ? (
        <Text style={[styles.feedback, { color: colors.primary }]}>
          {success}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  rightBtn: {
    padding: 4,
  },
  feedback: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});
