import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "@/src/components/Button";

const mockTheme = {
  colors: {
    primary: "#005EA4",
    primaryTransparent: "rgba(0, 94, 164, 0.12)",
  },
  shadows: {
    button: {
      shadowColor: "#005EA4",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
    },
  },
  radius: {
    button: 50,
  },
};

jest.mock("@/src/theme/ThemeContext", () => ({
  useAppTheme: () => mockTheme,
}));

describe("Button", () => {
  it("renders with title", async () => {
    const { getByText } = await render(<Button title="Login" onPress={() => {}} />);
    expect(getByText("Login")).toBeTruthy();
  });

  it("calls onPress when pressed", async () => {
    const onPress = jest.fn();
    const { getByText } = await render(<Button title="Login" onPress={onPress} />);
    fireEvent.press(getByText("Login"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <Button title="Login" onPress={onPress} disabled />,
    );
    fireEvent.press(getByText("Login"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("shows loading indicator when loading", async () => {
    const { queryByText } = await render(
      <Button title="Login" onPress={() => {}} loading />,
    );
    expect(queryByText("Login")).toBeNull();
  });
});
