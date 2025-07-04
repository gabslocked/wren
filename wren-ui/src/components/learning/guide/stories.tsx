import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { NextRouter } from 'next/router';
import { Select } from 'antd';
import styled from 'styled-components';
import { ModelIcon, TranslateIcon } from '@/utils/icons';
import { RobotSVG } from '@/utils/svgs';
import { renderToString } from 'react-dom/server';
import {
  Dispatcher,
  DriverConfig,
  DriverObj,
  DriverPopoverDOM,
  LEARNING,
} from './utils';
import { Path } from '@/utils/enum';
import {
  ProjectLanguage,
  SampleDatasetName,
} from '@/apollo/client/graphql/__types__';
import { TEMPLATE_OPTIONS as SAMPLE_DATASET_INFO } from '@/components/pages/setup/utils';
import { getLanguageText } from '@/utils/language';
import * as events from '@/utils/events';
import { nextTick } from '@/utils/time';

const RobotIcon = styled(RobotSVG)`
  width: 24px;
  height: 24px;
`;

const defaultConfigs: DriverConfig = {
  progressText: '{{current}} / {{total}}',
  nextBtnText: 'Next',
  prevBtnText: 'Previous',
  showButtons: ['next'],
  allowClose: false,
};

type StoryPayload = {
  sampleDataset: SampleDatasetName;
  language: ProjectLanguage;
};

export const makeStoriesPlayer =
  (...args: [DriverObj, NextRouter, StoryPayload]) =>
  (id: string, dispatcher: Dispatcher) => {
    const action =
      {
        [LEARNING.DATA_MODELING_GUIDE]: () =>
          playDataModelingGuide(...args, dispatcher),
        [LEARNING.SWITCH_PROJECT_LANGUAGE]: () =>
          playSwitchProjectLanguageGuide(...args, dispatcher),
        [LEARNING.KNOWLEDGE_GUIDE]: () =>
          playKnowledgeGuide(...args, dispatcher),
        [LEARNING.SAVE_TO_KNOWLEDGE]: () =>
          playSaveToKnowledgeGuide(...args, dispatcher),
      }[id] || null;
    return action && action();
  };

const resetPopoverStyle = (popoverDom: DriverPopoverDOM, width: number) => {
  const wrapper = popoverDom.wrapper;
  wrapper.style.maxWidth = 'none';
  wrapper.style.width = `${width}px`;
};

const playDataModelingGuide = (
  $driver: DriverObj,
  router: NextRouter,
  payload: StoryPayload,
  dispatcher: Dispatcher,
) => {
  if ($driver === null) {
    console.error('Driver object is not initialized.');
    return;
  }
  if ($driver.isActive()) $driver.destroy();

  const isSampleDataset = !!payload.sampleDataset;
  const sampleDatasetInfo = SAMPLE_DATASET_INFO[payload.sampleDataset];

  $driver.setConfig({ ...defaultConfigs, showProgress: true });
  $driver.setSteps([
    {
      popover: {
        title: renderToString(
          <div className="pt-4">
            <div className="-mx-4" style={{ minHeight: 331 }}>
              <img
                className="mb-4"
                src="/images/learning/data-modeling.jpg"
                alt="data-modeling-guide"
              />
            </div>
            Data modeling guide
          </div>,
        ),
        description: renderToString(
          <>
            Data modeling adds a logical layer over your original data schema,
            organizing relationships, semantics, and calculations. This helps AI
            align with business logic, retrieve precise data, and generate
            meaningful insights.{' '}
            <a
              href="https://docs.getwren.ai/oss/guide/modeling/overview"
              target="_blank"
              rel="noopener noreferrer"
            >
              More details
            </a>
            <br />
            <br />
            {isSampleDataset ? (
              <>
                We use {sampleDatasetInfo.label} Dataset to present the guide.
                To know more, please visit{' '}
                <a
                  href={sampleDatasetInfo.guide}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  about the {sampleDatasetInfo.label} Dataset.
                </a>
              </>
            ) : null}
          </>,
        ),
        showButtons: ['next', 'close'],
        onPopoverRender: (popoverDom: DriverPopoverDOM) => {
          resetPopoverStyle(popoverDom, 720);
        },
        onCloseClick: () => {
          $driver.destroy();
          window.sessionStorage.setItem('skipDataModelingGuide', '1');
        },
      },
    },
    {
      element: '[data-guideid="add-model"]',
      popover: {
        title: renderToString(
          <>
            <div className="mb-1">
              <ModelIcon style={{ fontSize: 24 }} />
            </div>
            Create a model
          </>,
        ),
        description: renderToString(
          <>Click the add icon to start create your first model.</>,
        ),
      },
    },
    {
      element: '[data-guideid="edit-model-0"]',
      popover: {
        title: renderToString(
          <>
            <div className="-mx-4" style={{ minHeight: 175 }}>
              <img
                className="mb-2"
                src="/images/learning/edit-model.gif"
                alt="edit-model"
              />
            </div>
            Edit a model
          </>,
        ),
        description: renderToString(
          <>Click the more icon to update the columns of model or delete it.</>,
        ),
      },
    },
    {
      element: '[data-guideid="model-0"]',
      popover: {
        title: renderToString(
          <>
            <div className="-mx-4" style={{ minHeight: 214 }}>
              <img
                className="mb-2"
                src="/images/learning/edit-metadata.gif"
                alt="edit-metadata"
              />
            </div>
            Edit metadata
          </>,
        ),
        description: renderToString(
          <>
            You could edit alias (alternative name) and descriptions of models
            and columns.
          </>,
        ),
        onPopoverRender: (popoverDom: DriverPopoverDOM) => {
          resetPopoverStyle(popoverDom, 360);
        },
      },
    },
    {
      element: '[data-guideid="deploy-model"]',
      popover: {
        title: renderToString(
          <>
            <div className="-mx-4" style={{ minHeight: 102 }}>
              <img
                className="mb-2"
                src="/images/learning/deploy-modeling.jpg"
                alt="deploy-modeling"
              />
            </div>
            Deploy modeling
          </>,
        ),
        description: renderToString(
          <>After editing the models, remember to deploy the changes.</>,
        ),
      },
    },
    {
      popover: {
        title: renderToString(
          <>
            <div className="-mx-4" style={{ minHeight: 331 }}>
              <img
                className="mb-2"
                src="/images/learning/ask-question.jpg"
                alt="ask-question"
              />
            </div>
            Ask questions
          </>,
        ),
        description: renderToString(
          <>
            When you finish editing your models, you can visit “Home” and start
            asking questions.
          </>,
        ),
        onPopoverRender: (popoverDom: DriverPopoverDOM) => {
          resetPopoverStyle(popoverDom, 720);
        },
        doneBtnText: 'Go to Home',
        onNextClick: () => {
          router.push(Path.Home);
          $driver.destroy();
          dispatcher?.onDone && dispatcher.onDone();
        },
      },
    },
  ]);
  events.dispatch(events.EVENT_NAME.GO_TO_FIRST_MODEL);
  $driver.drive();
};

// React component for home guide
const LanguageSwitcher = (props: { defaultValue: ProjectLanguage }) => {
  const [value, setValue] = useState(props.defaultValue);
  const languageOptions = Object.keys(ProjectLanguage).map((key) => {
    return { label: getLanguageText(key as ProjectLanguage), value: key };
  });
  const onChange = (value: string) => {
    setValue(value as ProjectLanguage);
  };

  return (
    <>
      <label className="d-block mb-2">Project language</label>
      <Select
        showSearch
        style={{ width: '100%' }}
        options={languageOptions}
        getPopupContainer={(trigger) => trigger.parentElement}
        onChange={onChange}
        value={value}
      />
      <input name="language" type="hidden" value={value} />
    </>
  );
};

const playSwitchProjectLanguageGuide = (
  $driver: DriverObj,
  _router: NextRouter,
  payload: StoryPayload,
  dispatcher: Dispatcher,
) => {
  if ($driver === null) {
    console.error('Driver object is not initialized.');
    return;
  }
  if ($driver.isActive()) $driver.destroy();

  $driver.setConfig({ ...defaultConfigs, showProgress: false });
  $driver.setSteps([
    {
      popover: {
        title: renderToString(
          <>
            <div className="mb-1">
              <TranslateIcon style={{ fontSize: 24 }} />
            </div>
            Switch the language
          </>,
        ),
        description: renderToString(
          <>
            Choose your preferred language. Once set up, AI will respond in your
            chosen language.
            <div className="my-3">
              <div id="projectLanguageContainer" />
            </div>
            You can go to project settings to change it if you change your mind.
          </>,
        ),
        onPopoverRender: (popoverDom: DriverPopoverDOM) => {
          resetPopoverStyle(popoverDom, 400);
          // Render react component to #projectLanguageContainer
          const selectDom = document.getElementById('projectLanguageContainer');
          if (selectDom) {
            createRoot(selectDom).render(
              <LanguageSwitcher defaultValue={payload.language} />,
            );
          }
        },
        showButtons: ['next', 'close'],
        nextBtnText: 'Submit',
        onCloseClick: () => {
          $driver.destroy();
          window.sessionStorage.setItem('skipSwitchProjectLanguageGuide', '1');
        },
        onNextClick: async () => {
          const selectDom = document.getElementById('projectLanguageContainer');
          if (selectDom) {
            const input = selectDom.querySelector(
              'input[name="language"]',
            ) as HTMLInputElement;
            const nextButton = document.querySelectorAll(
              '.driver-popover-next-btn',
            )[0];

            const loadingSvg = document.createElement('span');
            loadingSvg.setAttribute('aria-hidden', 'loading');
            loadingSvg.setAttribute('role', 'img');
            loadingSvg.className =
              'anticon anticon-loading anticon-spin text-sm gray-6 ml-2';
            loadingSvg.innerHTML = `<svg viewBox="0 0 1024 1024" focusable="false" data-icon="loading" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path></svg>`;
            nextButton.setAttribute('disabled', 'true');
            nextButton.appendChild(loadingSvg);
            await dispatcher
              ?.onSaveLanguage(input.value as ProjectLanguage)
              .catch((err) => console.error(err))
              .finally(() => {
                nextButton.removeAttribute('disabled');
                nextButton.removeChild(loadingSvg);
              });
          }
          $driver.destroy();
          dispatcher?.onDone();
        },
      },
    },
  ]);
  $driver.drive();
};

const playKnowledgeGuide = (
  $driver: DriverObj,
  _router: NextRouter,
  _payload: StoryPayload,
  dispatcher: Dispatcher,
) => {
  if ($driver === null) {
    console.error('Driver object is not initialized.');
    return;
  }

  if ($driver.isActive()) $driver.destroy();

  $driver.setConfig({ ...defaultConfigs, showProgress: true });

  $driver.setSteps([
    {
      element: '[data-guideid="question-sql-pairs"]',
      popover: {
        title: renderToString(
          <div className="pt-4">
            <div className="-mx-4" style={{ minHeight: 317 }}>
              <img
                className="mb-4"
                src="/images/learning/save-to-knowledge.gif"
                alt="question-sql-pairs-guide"
              />
            </div>
            Build knowledge base: Question-SQL pairs
          </div>,
        ),
        description: renderToString(
          <>
            Create and manage <b>Question-SQL pairs</b> to refine Rubix’s SQL
            generation. You can manually add pairs here or go to Home, ask a
            question, and save the correct answer to Knowledge. The more you
            save, the smarter Rubix becomes!
          </>,
        ),
        onPopoverRender: (popoverDom: DriverPopoverDOM) => {
          resetPopoverStyle(popoverDom, 640);
        },
      },
    },
    {
      element: '[data-guideid="instructions"]',
      popover: {
        title: renderToString(
          <div className="pt-4">
            <div className="-mx-4" style={{ minHeight: 260 }}>
              <img
                className="mb-4"
                src="/images/learning/instructions.png"
                alt="instructions-guide"
              />
            </div>
            Build knowledge base: Instructions
          </div>,
        ),
        description: renderToString(
          <>
            In addition to Question-SQL pairs, you can create instructions to
            define <b>business rules</b> and <b>query logic</b>. These rules
            guide Rubix in applying consistent filters, constraints, and best
            practices to SQL queries.
          </>,
        ),
        onPopoverRender: (popoverDom: DriverPopoverDOM) => {
          resetPopoverStyle(popoverDom, 520);
        },
        doneBtnText: 'Got it',
        onNextClick: () => {
          $driver.destroy();
          dispatcher?.onDone && dispatcher.onDone();
        },
      },
    },
  ]);
  $driver.drive();
};

const playSaveToKnowledgeGuide = async (
  $driver: DriverObj,
  _router: NextRouter,
  _payload: StoryPayload,
  dispatcher: Dispatcher,
) => {
  if ($driver === null) {
    console.error('Driver object is not initialized.');
    return;
  }
  if ($driver.isActive()) $driver.destroy();

  $driver.setConfig({ ...defaultConfigs, showProgress: false });

  const selectors = {
    saveToKnowledge:
      '[data-guideid="last-answer-result"] [data-guideid="save-to-knowledge"]',
    previewData:
      '[data-guideid="last-answer-result"] [data-guideid="text-answer-preview-data"]',
  };

  $driver.setSteps([
    {
      element: selectors.saveToKnowledge,
      popover: {
        side: 'top',
        align: 'start',
        title: renderToString(
          <>
            <div className="mb-1">
              <RobotIcon />
            </div>
            Save to knowledge
          </>,
        ),
        description: renderToString(
          <>
            If the AI-generated answer is correct, save it as a{' '}
            <b>Question-SQL pair</b> to improve AI learning. If it's incorrect,
            refine it with follow-ups before saving to ensure accuracy.
          </>,
        ),
        onPopoverRender: (popoverDom: DriverPopoverDOM) => {
          resetPopoverStyle(popoverDom, 360);
        },
        doneBtnText: 'Got it',
        onNextClick: () => {
          $driver.destroy();
          dispatcher?.onDone && dispatcher.onDone();
        },
      },
    },
  ]);

  let mutationObserver: MutationObserver | null = null;
  let intersectionObserver: IntersectionObserver | null = null;

  const cleanMutationObserverup = () => {
    // if MutationObserver is listening to the element, disable it
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }
  };

  const cleanIntersectionObserverup = () => {
    if (intersectionObserver) {
      intersectionObserver.disconnect();
      intersectionObserver = null;
    }
  };

  const startDriver = () => {
    const target = document.querySelector(
      selectors.previewData,
    ) as HTMLElement | null;

    if (!target) return false;

    cleanMutationObserverup();

    // use IntersectionObserver to ensure the element is in viewport before driving
    intersectionObserver = new IntersectionObserver(
      async (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            cleanIntersectionObserverup();

            await nextTick(700);
            $driver.drive();
            return;
          }
        }
      },
      { threshold: 0.5 }, // 50% of the element is visible
    );

    intersectionObserver.observe(target);
    return true;
  };

  // try to start Driver.js
  if (startDriver()) return;

  // if the target element not appear, use MutationObserver to listen DOM changes
  mutationObserver = new MutationObserver(() => {
    if (startDriver()) {
      cleanMutationObserverup();
    }
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });

  // 60 seconds after, observer will be cleared
  await nextTick(60000);
  cleanMutationObserverup();
  cleanIntersectionObserverup();
};
