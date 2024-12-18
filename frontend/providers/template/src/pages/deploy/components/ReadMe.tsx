import MyIcon from '@/components/Icon';
import { TemplateType } from '@/types/app';
import { Box } from '@chakra-ui/react';
import 'github-markdown-css/github-markdown-light.css';
import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkUnwrapImages from 'remark-unwrap-images';
import rehypeRewrite from 'rehype-rewrite';
import styles from './index.module.scss';
import { parseGithubUrl } from '@/utils/tools';
import { Octokit, App } from 'octokit';
import { useTranslation } from 'next-i18next';

const ReadMe = ({ templateDetail }: { templateDetail: TemplateType }) => {
  const { i18n } = useTranslation();
  const [templateReadMe, setTemplateReadMe] = useState('');

  const readme =
    templateDetail?.spec?.i18n?.[i18n.language]?.readme ?? templateDetail?.spec?.readme;

  // const octokit = new Octokit({
  //   auth: ''
  // });
  // useEffect(() => {
  //   (async () => {
  //     const result = await octokit.request('GET /repos/{owner}/{repo}/readme', {
  //       owner: 'appsmithorg',
  //       repo: 'appsmith',
  //       headers: {}
  //     });
  //     console.log(result);
  //   })();
  // }, []);

  const githubOptions = useMemo(() => parseGithubUrl(readme), [readme]);

  useEffect(() => {
    if (readme) {
      (async () => {
        try {
          const res = await (await fetch(readme)).text();
          setTemplateReadMe(res);
        } catch (error) {
          console.log(error);
        }
      })();
    }
  }, [readme]);

  // @ts-ignore
  const myRewrite = (node, index, parent) => {
    if (node.tagName === 'img' && !node.properties.src.startsWith('http')) {
      const imgSrc = node.properties.src.replace(/^\.\/|^\//, '');

      node.properties.src = `https://${githubOptions?.hostname}/${githubOptions?.organization}/${githubOptions?.repository}/${githubOptions?.branch}/${imgSrc}`;
    }
  };

  return (
    <Box flexGrow={1} border={'1px solid #DFE2EA'} mt={'16px'} borderRadius={'8px'}>
      <Box
        p={'16px 0'}
        borderBottom={'1px solid #E8EBF0'}
        color={'#24282C'}
        fontSize={'16px'}
        fontWeight={500}
      >
        <MyIcon name={'markdown'} mr={'8px'} w={'20px'} ml={'42px'} color={'myGray.500'} />
        README.md
      </Box>
      <Box borderRadius={'8px'} p={'24px'} className={`markdown-body ${styles.customMarkDownBody}`}>
        <ReactMarkdown
          linkTarget={'_blank'}
          rehypePlugins={[rehypeRaw, [rehypeRewrite, { rewrite: myRewrite }]]}
          remarkPlugins={[remarkGfm, remarkUnwrapImages]}
        >
          {templateReadMe}
        </ReactMarkdown>
      </Box>
    </Box>
  );
};

export default ReadMe;
