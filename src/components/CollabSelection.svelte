
<script lang="ts">
  import Button, {Icon} from '@smui/button';
  import List, {Item, Text} from '@smui/list';
  import Textfield from '@smui/textfield';
  import {Label} from '@smui/common';

  import { userInfo } from '@/store';
  import { findMyCollabs } from '@/helpers/drive';
  import { openPuller } from '@/helpers/utils';
  import { fileCreationProcess } from '@/helpers/collab';
  import { goBackPage } from '@/helpers/pages';
  import type { Collab as CollabInterface } from '@/types/interfaces';
  import { saveLastUsedCollab, getLastUsedCollab } from '@/helpers/storage';

  const limitCollabsToShow = 10;
  let processing = false;
  let collabsLoading = false;
  let collabSelectedName = '';
  let collabs: Array<CollabInterface> = []; // full collabs
  let filteredCollabsNames: Array<string> = [];
  let searchText = '';
  let lastUsedCollabName = '';
  
  userInfo.subscribe((newUser: Oidc.User) => {
    if (!newUser?.access_token) return;
    showMyCollabs();
    lastUsedCollabName = getLastUsedCollab();
  });

  async function createFiles() {
    processing = true;
    saveLastUsedCollab(collabSelectedName);
    await fileCreationProcess(collabSelectedName);

    openPuller();

    processing = false;
    collabSelectedName = '';
  }

  function setFilteredCollabs(collabs: Array<CollabInterface>, showPagination = false) {
    filteredCollabsNames = [];
    if (showPagination) {
      filteredCollabsNames = collabs
        .slice(0, limitCollabsToShow)
        .map(collab => collab.name);
      filteredCollabsNames.push('...');
      return filteredCollabsNames;
    }
    // show all when searching
    filteredCollabsNames = collabs.map(collab => collab.name);
  }

  async function showMyCollabs() {
    collabsLoading = true;
    collabs = await findMyCollabs();
    collabsLoading = false;
    setFilteredCollabs(collabs, true);
  }

  function collabSelected(collabName: string) {
    if (collabName === '...') {
      // show all collabs
      setFilteredCollabs(collabs);
      return;
    }
    collabSelectedName = collabName;
  }

  function filterCollab() {
    const searchParam = searchText;
    if (searchParam === '') { // reset filter
      setFilteredCollabs(collabs, true);
      return;
    }
    const filteredCollabsNames =  collabs.filter((collab: CollabInterface) =>
      collab.name.toLowerCase().includes(searchParam.toLowerCase())
    );
    setFilteredCollabs(filteredCollabsNames);
  }

</script>



<section class="collab-section-container">
  <div class="custom-section-header">
    <div class="go-back-btn">
      <Icon class="material-icons" on:click={goBackPage}>keyboard_backspace</Icon>
    </div>
    <h2 class="page-header-title">Please select the destination Collab</h2>
  </div>
  <div class="collab-list">
    <!-- Select Collab -->
    {#if collabsLoading}
      <span>Loading...</span>
    {/if}
    
    {#if !collabsLoading && collabs.length}
      <div class="top-bar">
        <div class="search-box">
          <div class="search-label">Search</div>
          <Textfield
            class="shaped-outlined custom-search"
            variant="outlined"
            label="Collab Name"
            bind:value={searchText}
            on:change={filterCollab}
          />
        </div>

        <div class="processing-container">
          <Button
            on:click={createFiles}
            disabled={processing || !collabSelectedName}
            color="secondary"
            variant="unelevated"
          >
            <Label>{processing ? 'Processing' : 'Use Collab'}</Label>
          </Button>
        </div>
      </div>

      <div class="last-used-collab">
        {#if lastUsedCollabName}
          <Item on:click={collabSelected(lastUsedCollabName)}>
            <Text><strong>Last used: </strong>{lastUsedCollabName}</Text>
          </Item>
        {/if}
      </div>

      <List>
        {#each filteredCollabsNames as collabName}
          <Item on:click={collabSelected(collabName)}>
            <Text>{collabName}</Text>
          </Item>
        {/each}
      </List>    
    {/if}
  </div>
</section>



<style>
  .processing-container {
    max-width: 50%;
    margin: 20px auto;
  }
  .search-box {
    display: flex;
    align-items: center;
    flex-grow: 1;
  }
  .search-box .search-label {
    margin: 0 15px;
    display: inline-block;
    font-size: 20px;
  }
  .top-bar {
    display: flex;
    align-items: center;
  }
  .collab-list {
    max-width: 650px;
    margin: 0 auto;
  }
</style>