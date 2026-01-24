import React from "react";
import { useForm } from "react-hook-form";

export default function App() {
  const { register, reset, handleSubmit } = useForm({
    defaultValues: { nickname: "", bio: "" },
  });

  React.useEffect(() => {
    (async () => {
      const data = await fetch("/api/profile").then((r) => r.json());
      reset(data); // ✅ 回填
    })();
  }, [reset]);

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input {...register("nickname")} />
      <textarea {...register("bio")} />
      <button>Save</button>
    </form>
  );
}
