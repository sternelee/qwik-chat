const fetchChat = async (body: any) => {
  const { key, model, version = "2023-08-01-preview", ...rest } = body;
  return await fetch(
    `/openai/deployments/${model}/chat/completions?api-version=${version}`,
    {
      headers: {
        "Content-Type": "application/json",
        "api-key": key,
      },
      method: "POST",
      body: JSON.stringify(rest),
    }
  );
};

const genImage = async (body: any) => {
  const { key, version = "2023-08-01-preview", ...rest } = body;
  return await fetch(
    `.openai.azure.com/openai/images/generations:submit?api-version=${version}`,
    {
      headers: {
        "Content-Type": "application/json",
        "api-key": key,
      },
      method: "POST",
      body: JSON.stringify(rest),
    }
  );
};
