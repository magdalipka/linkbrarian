import { Flex, Input, Button } from "@chakra-ui/react";
import { useData } from "@src/context/dataContext";
import React, { FunctionComponent } from "react";

export const TokenInput: FunctionComponent = () => {
  const data = useData();
  const [value, setValue] = React.useState("");
  const handleChange = (event: any) => setValue(event.target.value);

  return (
    <Flex alignItems="center">
      <Input
        value={value}
        onChange={handleChange}
        placeholder="Access Token"
        // size="sm"
      />
      <Button
        colorScheme="pink"
        onClick={() => {
          data.setAuth({
            accessToken: value,
          });
        }}
      >
        Save
      </Button>
    </Flex>
  );
};
