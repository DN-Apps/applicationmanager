import { useState } from "react";
import { Rive, useRive } from "@rive-app/react-canvas";

function InteractiveAnimation() {
  const [isPlaying, setIsPlaying] = useState(true);
  const { RiveComponent } = useRive({
    src: "mario.riv",
    autoplay: isPlaying,
  });

  return (
    <div>
      <div style={{ width: "300px", height: "300px" }}>
        <RiveComponent />
      </div>
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
}

export default InteractiveAnimation;