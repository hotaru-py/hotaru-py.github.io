<script>
  import { onMount } from "svelte";
  import About from "./Components/about.svelte";
  import Skills from "./Components/skills.svelte";
  import Projects from "./Components/projects.svelte";
  import Reach from "./Components/reach.svelte";

  let welcomeSwipe = false;
  let footerOn = false;
  let curPage = 1;

  function upClick() {
    if (curPage > 1) {
      curPage -= 1;
    }
  }

  function downClick() {
    if (curPage < 4) {
      curPage += 1;
    }
  }

  onMount(() => {
    setTimeout(() => {
      footerOn = true;
      welcomeSwipe = true;
    }, 2500);
  });
</script>

<div class="bg-[#F4F4F4] flex flex-col min-h-screen justify-between">
  {#if curPage == 1}
    <About status={welcomeSwipe} />
  {:else if curPage == 2}
    <Skills />
  {:else if curPage == 3}
    <Projects />
  {:else}
    <Reach />
  {/if}

  <footer
    class={`transition-opacity transition-max-height duration-700 ease-in-out ${footerOn ? "opacity-100 max-h-[500px]" : "opacity-0 max-h-0 invisible"}`}
  >
    <div class="bg-black h-0.5 m-8"></div>
    <div class="flex m-8 mb-10 items-center justify-center">
      <div class="flex">
        <div>
          <a
            class="group transition-all duration-150"
            href="https://github.com/hotaru-hspr"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span
              class="ml-8 p-1 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-200 ease-out"
            >
              GitHub
            </span>
          </a>
        </div>
        <div>
          <a
            class="group transition-all duration-200"
            href="https://linkedin.com/in/prajesh-raam"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span
              class="ml-8 p-1 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-200 ease-out"
            >
              LinkedIn
            </span>
          </a>
        </div>
        <div>
          <a
            class="group transition-all duration-200"
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span
              class="ml-8 p-1 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-200 ease-out"
            >
              Resume
            </span>
          </a>
        </div>
        <div>
          <a
            class="group transition-all duration-200"
            href="mailto:stu.prajeshraam@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span
              class="ml-8 p-1 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-200 ease-out"
            >
              E-mail
            </span>
          </a>
        </div>
      </div>
      <div class="ml-auto flex items-center justify-center mr-8">
        <h1 class="text-6xl my-4">
          {#if curPage == 1}
            About me
          {:else if curPage == 2}
            Skills
          {:else if curPage == 3}
            Projects
          {:else}
            Reach out
          {/if}
        </h1>
        <div class="ml-8 flex flex-col">
          {#if curPage == 1}
            <button
              class="arrow-up mt-3 border-gray-400 cursor-default"
              on:click={upClick}
            ></button>
          {:else}
            <button
              class="arrow-up mt-3 transition border-black"
              on:click={upClick}
            ></button>
          {/if}
          {#if curPage == 4}
            <button
              class="arrow-down mt-2 transition border-gray-400 cursor-default"
              on:click={downClick}
            ></button>
          {:else}
            <button
              class="arrow-down mt-2 transition border-black"
              on:click={downClick}
            ></button>
          {/if}
        </div>
      </div>
    </div>
  </footer>
</div>
