'use client';
import { useEffect, useState } from 'react';
import { AppSettings } from '@/app/_data-models/AppSettings';
import Section from '../Section';
import Switch from '../Switch';

export default function HordeSettings() {
  const [allowNsfw, setAllowNsfw] = useState(false);
  const [downgrade, setDowngrade] = useState(true);
  const [promptReplacement, setPromptReplacement] = useState(true);
  const [slowWorkers, setSlowWorkers] = useState(true);
  const [useTrusted, setUseTrusted] = useState(true);

  const handleToggleSetting = (setting: string) => {
    switch (setting) {
      case 'slowWorkers':
        AppSettings.set(
          'slow_workers',
          AppSettings.get('slow_workers') ? false : true
        );
        setSlowWorkers((prev) => !prev);
        break;
      case 'promptReplacement':
        AppSettings.set(
          'useReplacementFilter',
          AppSettings.get('useReplacementFilter') ? false : true
        );
        setPromptReplacement((prev) => !prev);
        break;
      case 'downgrade':
        AppSettings.set(
          'autoDowngrade',
          AppSettings.get('autoDowngrade') ? false : true
        );
        setDowngrade((prev) => !prev);
        break;
      case 'useTrusted':
        AppSettings.set(
          'useTrusted',
          AppSettings.get('useTrusted') ? false : true
        );
        setUseTrusted((prev) => !prev);
        break;
      case 'allowNsfw':
        AppSettings.set(
          'allowNsfwImages',
          AppSettings.get('allowNsfwImages') ? false : true
        );
        setAllowNsfw((prev) => !prev);
        break;
    }
  };

  useEffect(() => {
    setAllowNsfw(AppSettings.get('allowNsfwImages'));
    setDowngrade(AppSettings.get('autoDowngrade'));
    setPromptReplacement(AppSettings.get('useReplacementFilter'));
    setSlowWorkers(AppSettings.get('slow_workers'));
    setUseTrusted(AppSettings.get('useTrusted'));
  }, []);

  return (
    <Section accordion anchor="horde-settings" title="Horde settings">
      <label className="row gap-2 text-white">
        <Switch
          checked={downgrade}
          onChange={() => {
            handleToggleSetting('downgrade');
          }}
        />
        Auto downgrade
      </label>
      <label className="row gap-2 text-white">
        <Switch
          checked={slowWorkers}
          onChange={() => {
            handleToggleSetting('slowWorkers');
          }}
        />
        Allow slow workers
      </label>
      <label className="row gap-2 text-white">
        <Switch
          checked={allowNsfw}
          onChange={() => {
            handleToggleSetting('allowNsfw');
          }}
        />
        Allow NSFW
      </label>
      <label className="row gap-2 text-white">
        <Switch
          checked={promptReplacement}
          onChange={() => {
            handleToggleSetting('promptReplacement');
          }}
        />
        Prompt filter
      </label>
      <label className="row gap-2 text-white">
        <Switch
          checked={useTrusted}
          onChange={() => {
            handleToggleSetting('useTrusted');
          }}
        />
        Use trusted workers
      </label>
    </Section>
  );
}
