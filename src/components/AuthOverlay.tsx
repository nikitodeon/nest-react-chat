import {
  Button,
  Grid,
  Group,
  Modal,
  Paper,
  Text,
  TextInput,
} from "@mantine/core";
import React, { useState } from "react";
import { useGeneralStore } from "../stores/generalStore";
import { useForm } from "@mantine/form";
import { useUserStore } from "../stores/userStore";
import { GraphQLErrorExtensions } from "graphql";
import { useMutation } from "@apollo/client";
import { LoginUserMutation, RegisterUserMutation } from "../gql/graphql";
import { REGISTER_USER } from "../graphql/mutations/Register";
import { LOGIN_USER } from "../graphql/mutations/Login";

function AuthOverlay() {
  const isLoginModalOpen = useGeneralStore((state) => state.isLoginModalOpen);
  const toggleLoginModal = useGeneralStore((state) => state.toggleLoginModal);
  const [isRegister, setIsRegister] = useState(true);
  const toggleForm = () => setIsRegister(!isRegister);

  const Register = () => {
    const form = useForm({
      initialValues: {
        fullname: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      validate: {
        fullname: (value: string) =>
          value.trim().length >= 3
            ? null
            : "Username must be at least 3 characters",
        email: (value: string) =>
          value.includes("@") ? null : "Invalid email",
        password: (value: string) =>
          value.trim().length >= 3
            ? null
            : "Password must be at least 3 characters",
        confirmPassword: (value: string, values) =>
          value.trim().length >= 3 && value === values.password
            ? null
            : "Passwords do not match",
      },
    });

    const setUser = useUserStore((state) => state.setUser);
    const setIsLoginOpen = useGeneralStore((state) => state.toggleLoginModal);

    const [errors, setErrors] = React.useState<GraphQLErrorExtensions>({});
    const [registerUser, { loading }] =
      useMutation<RegisterUserMutation>(REGISTER_USER);

    const handleRegister = async () => {
      setErrors({});
      await registerUser({
        variables: {
          email: form.values.email,
          password: form.values.password,
          fullname: form.values.fullname,
          confirmPassword: form.values.confirmPassword,
        },
        onCompleted: (data) => {
          setErrors({});
          if (data?.register.user)
            setUser({
              id: data.register.user.id,
              email: data.register.user.email,
              fullname: data.register.user.fullname,
            });
          setIsLoginOpen();
        },
      }).catch((err) => {
        setErrors(err.graphQLErrors[0].extensions);
        useGeneralStore.setState({ isLoginModalOpen: true });
      });
    };

    return (
      <Paper>
        <Text size="xl" style={{ textAlign: "center" }}>
          Register
        </Text>
        <form onSubmit={form.onSubmit(handleRegister)}>
          <Grid mt={20}>
            <Grid.Col span={12}>
              <TextInput
                label="Fullname"
                placeholder="Enter your full name"
                {...form.getInputProps("fullname")}
                error={form.errors.fullname || (errors?.fullname as string)}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                autoComplete="off"
                label="Email"
                placeholder="Enter your email"
                {...form.getInputProps("email")}
                error={form.errors.email || (errors?.email as string)}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                autoComplete="off"
                label="Password"
                type="password"
                placeholder="Enter your password"
                {...form.getInputProps("password")}
                error={form.errors.password || (errors?.password as string)}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                autoComplete="off"
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                {...form.getInputProps("confirmPassword")}
                error={
                  form.errors.confirmPassword ||
                  (errors?.confirmPassword as string)
                }
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Button variant="link" onClick={toggleForm} pl={0}>
                Already registered? Login here
              </Button>
            </Grid.Col>
          </Grid>
          <Group mt={20}>
            <Button
              variant="outline"
              color="blue"
              type="submit"
              disabled={loading}
            >
              Register
            </Button>
            <Button variant="outline" color="red" onClick={toggleLoginModal}>
              Cancel
            </Button>
          </Group>
        </form>
      </Paper>
    );
  };

  const Login = () => {
    const [loginUser, { loading }] = useMutation<LoginUserMutation>(LOGIN_USER);
    const setUser = useUserStore((state) => state.setUser);
    const setIsLoginOpen = useGeneralStore((state) => state.toggleLoginModal);
    const [errors, setErrors] = React.useState<GraphQLErrorExtensions>({});
    const [invalidCredentials, setInvalidCredentials] = React.useState("");

    const form = useForm({
      initialValues: {
        email: "",
        password: "",
      },
      validate: {
        email: (value: string) =>
          value.includes("@") ? null : "Invalid email",
        password: (value: string) =>
          value.trim().length >= 3
            ? null
            : "Password must be at least 3 characters",
      },
    });

    const handleLogin = async () => {
      await loginUser({
        variables: {
          email: form.values.email,
          password: form.values.password,
        },
        onCompleted: (data) => {
          setErrors({});
          if (data?.login.user) {
            setUser({
              id: data.login.user.id,
              email: data.login.user.email,
              fullname: data.login.user.fullname,
              avatarUrl: data.login.user.avatarUrl,
            });
            setIsLoginOpen();
          }
        },
      }).catch((err) => {
        setErrors(err.graphQLErrors[0].extensions);
        if (err.graphQLErrors[0].extensions?.invalidCredentials)
          setInvalidCredentials(
            err.graphQLErrors[0].extensions.invalidCredentials
          );
        useGeneralStore.setState({ isLoginModalOpen: true });
      });
    };

    return (
      <Paper>
        <Text size="xl" style={{ textAlign: "center" }}>
          Login
        </Text>
        <form onSubmit={form.onSubmit(handleLogin)}>
          <Grid mt={20}>
            <Grid.Col span={12}>
              <TextInput
                autoComplete="off"
                label="Email"
                placeholder="Enter your email"
                {...form.getInputProps("email")}
                error={form.errors.email || (errors?.email as string)}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                autoComplete="off"
                label="Password"
                type="password"
                placeholder="Enter your password"
                {...form.getInputProps("password")}
                error={form.errors.password || (errors?.password as string)}
              />
            </Grid.Col>
          </Grid>
          <Group mt={20}>
            <Button
              variant="outline"
              color="blue"
              type="submit"
              disabled={loading}
            >
              Login
            </Button>
            <Button variant="outline" color="red" onClick={toggleLoginModal}>
              Cancel
            </Button>
          </Group>
        </form>
      </Paper>
    );
  };

  return (
    <Modal centered opened={isLoginModalOpen} onClose={toggleLoginModal}>
      {isRegister ? <Register /> : <Login />}
    </Modal>
  );
}

export default AuthOverlay;
