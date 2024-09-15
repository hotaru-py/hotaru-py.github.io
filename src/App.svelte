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

<header
  class={`bg-[#f4f4f4] md:hidden flex flex-col my-4 sticky top-0 z-50 transition-opacity duration-700 ease-in-out ${
    footerOn ? "opacity-100" : "opacity-0 invisible"
  }`}
>
  <div class="flex items-center justify-between w-full px-4">
    <h1 class="text-2xl m-2">
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

    <div class="flex">
      {#if curPage == 1}
        <button
          class="arrow-left mt-1 border-gray-400 cursor-default"
          on:click={upClick}
        ></button>
      {:else}
        <button
          class="arrow-left mt-1 transition border-black"
          on:click={upClick}
        ></button>
      {/if}

      {#if curPage == 4}
        <button
          class="arrow-right mt-1 transition border-gray-400 cursor-default ml-4"
          on:click={downClick}
        ></button>
      {:else}
        <button
          class="arrow-right mt-1 transition border-black ml-4"
          on:click={downClick}
        ></button>
      {/if}
    </div>
  </div>
  <div class="w-full bg-black h-0.5 my-4 mx-2"></div>
</header>

<div
  class="bg-[#F4F4F4] flex flex-col h-full w-full justify-between items-center md:items-start md:pl-0"
>
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
    class={`bg-[#F4F4F4] fixed bottom-0 left-0 w-full z-50 md:px-8 md:py-2 transition-opacity duration-700 ease-in-out ${
      footerOn ? "opacity-100" : "opacity-0 invisible"
    }`}
  >
    <div class="bg-black h-0.5 m-2"></div>
    <div
      class="flex flex-wrap items-center justify-center sm:justify-between w-full sm:m-2 sm:mb-4 m-4 mb-4 md:mt-6 md:mx-8"
    >
      <div
        class="flex flex-wrap items-center justify-center sm:justify-start w-full sm:w-auto"
      >
        <div class="pr-8 sm:pr-8">
          <a
            class="group transition-all duration-150"
            href="https://github.com/hotaru-hspr"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span
              class="p-1 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-200 ease-out"
            >
              GitHub
            </span>
          </a>
        </div>
        <div class="pr-8 sm:pr-8">
          <a
            class="group transition-all duration-200"
            href="https://linkedin.com/in/prajesh-raam"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span
              class="p-1 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-200 ease-out"
            >
              LinkedIn
            </span>
          </a>
        </div>
        <div class="pr-8 sm:pr-8">
          <a
            class="group transition-all duration-200"
            href="mailto:prajeshraam@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span
              class="p-1 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-200 ease-out"
            >
              E-mail
            </span>
          </a>
        </div>
      </div>
      <div class="hidden md:flex items-center ml-auto mr-16">
        <h1 class="text-3xl my-4">
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
        <div class="flex flex-col pl-8">
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
