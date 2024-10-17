import { v4 as uuidv4 } from 'uuid';
import { Classes, HTMLSelect } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import dropRight from 'lodash/dropRight';
import React from 'react';
import {
  Corner,
  createBalancedTreeFromLeaves,
  getLeaves,
  getNodeAtPath,
  getOtherDirection,
  getPathToCorner,
  Mosaic,
  MosaicBranch,
  MosaicDirection,
  MosaicNode,
  MosaicParent,
  MosaicWindow,
  MosaicZeroState,
  updateTree,
} from '../src';
import { CloseAdditionalControlsButton } from './CloseAdditionalControlsButton';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '../styles/index.less';
import './carbon.less';
import './example.less';
import companiesData from './companies-lookup.json';
import { Companies, Company } from "./Company";

const gitHubLogo = require('./GitHub-Mark-Light-32px.png');
const { version } = require('../package.json');

export const THEMES = {
  ['Blueprint']: 'mosaic-blueprint-theme',
  ['Blueprint Dark']: classNames('mosaic-blueprint-theme', Classes.DARK),
  ['None']: '',
};

export type Theme = keyof typeof THEMES;

const additionalControls = React.Children.toArray([<CloseAdditionalControlsButton />]);
const EMPTY_ARRAY: any[] = [];

export interface ExampleAppState {
  currentNode: MosaicNode<string> | null;
  currentTheme: Theme;
}

export class ExampleApp extends React.PureComponent<{}, ExampleAppState> {
  state: ExampleAppState = {
    currentNode: {
      direction: 'row',
      first: uuidv4(),
      second: {
        direction: 'column',
        first: uuidv4(),
        second: uuidv4(),
      },
      splitPercentage: 40,
    },
    currentTheme: 'Blueprint',
  };

  render() {
    return (
      <React.StrictMode>
        <div className="react-mosaic-example-app">
          {this.renderNavBar()}
          <Mosaic<string>
            renderTile={(count, path) => (
              <CompanyWidgetInfo count={count} path={path} />
            )}
            zeroStateView={<MosaicZeroState createNode={() => uuidv4()} />}
            value={this.state.currentNode}
            onChange={this.onChange}
            onRelease={this.onRelease}
            className={THEMES[this.state.currentTheme]}
            blueprintNamespace="bp4"
          />
        </div>
      </React.StrictMode>
    );
  }

  private onChange = (currentNode: MosaicNode<string> | null) => {
    if (currentNode) {
      this.setState({ currentNode });
    }
  };

  private onRelease = (currentNode: MosaicNode<string> | null) => {
    console.log('Mosaic.onRelease():', currentNode);
  };

  private autoArrange = () => {
    const leaves = getLeaves(this.state.currentNode);
    this.setState({
      currentNode: createBalancedTreeFromLeaves(leaves),
    });
  };

  private addToTopRight = () => {
    let { currentNode } = this.state;

    if (currentNode) {
      const path = getPathToCorner(currentNode, Corner.TOP_RIGHT);
      const parent = getNodeAtPath(currentNode, dropRight(path)) as MosaicParent<string>;
      const destination = getNodeAtPath(currentNode, path) as MosaicNode<string>;
      const direction: MosaicDirection = parent ? getOtherDirection(parent.direction) : 'row';

      const newWindowId = uuidv4();

      let first: MosaicNode<string>;
      let second: MosaicNode<string>;
      if (direction === 'row') {
        first = destination;
        second = newWindowId;
      } else {
        first = newWindowId;
        second = destination;
      }

      currentNode = updateTree(currentNode, [
        {
          path,
          spec: {
            $set: {
              direction,
              first,
              second,
            },
          },
        },
      ]);
    } else {
      const newWindowId1 = uuidv4();
      const newWindowId2 = uuidv4();
      currentNode = {
        direction: 'row',
        first: newWindowId1,
        second: newWindowId2,
        splitPercentage: 50,
      };
    }

    this.setState({ currentNode });
  };


  private renderNavBar() {
    return (
      <div className={classNames(Classes.NAVBAR, Classes.DARK)}>
        <div className={Classes.NAVBAR_GROUP}>
          <div className={Classes.NAVBAR_HEADING}>
            <a href="https://github.com/nomcopter/react-mosaic">
              react-mosaic <span className="version">v{version}</span>
            </a>
          </div>
        </div>
        <div className={classNames(Classes.NAVBAR_GROUP, Classes.BUTTON_GROUP)}>
          <label className={classNames('theme-selection', Classes.LABEL, Classes.INLINE)}>
            Theme:
            <HTMLSelect
              value={this.state.currentTheme}
              onChange={(e) => this.setState({ currentTheme: e.currentTarget.value as Theme })}
            >
              {React.Children.toArray(Object.keys(THEMES).map((label) => <option>{label}</option>))}
            </HTMLSelect>
          </label>
          <div className="navbar-separator" />
          <span className="actions-label">Example Actions:</span>
          <button
            className={classNames(Classes.BUTTON, Classes.iconClass(IconNames.GRID_VIEW))}
            onClick={this.autoArrange}
          >
            Auto Arrange
          </button>
          <button
            className={classNames(Classes.BUTTON, Classes.iconClass(IconNames.ARROW_TOP_RIGHT))}
            onClick={this.addToTopRight}
          >
            Add Window to Top Right
          </button>
          <a className="github-link" href="https://github.com/nomcopter/react-mosaic">
            <img src={gitHubLogo} />
          </a>
        </div>
      </div>
    );
  }
}

interface CompanyWidgetInfoProps {
  count: string;
  path: MosaicBranch[];
}

const CompanyWidgetInfo = ({ count, path }: CompanyWidgetInfoProps) => {
  const [selectedCompany, setSelectedCompany] = React.useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = React.useState<Company | null>(null);

  const companies: Companies = companiesData;

  React.useEffect(() => {
    if (selectedCompany) {
      const company = companies.find((comp) => comp.ticker === selectedCompany);
      setCompanyInfo(company || null);
    }
  }, [selectedCompany, companies]);

  return (
    <MosaicWindow<string>
      additionalControls={count === '3' ? additionalControls : EMPTY_ARRAY}
      title={companyInfo ? companyInfo.name : 'Company Information'}
      createNode={() => uuidv4()}
      path={path}
      onDragStart={() => console.log('MosaicWindow.onDragStart')}
      onDragEnd={(type) => console.log('MosaicWindow.onDragEnd', type)}
      renderToolbar={count === '2' ? () => <div className="toolbar-example">Custom Toolbar</div> : null}
    >
      <div className="p-4 space-y-4">
        <div className="relative">
          <select
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
            style={{ maxWidth: '100%' }}
          >
            <option value="">Select a company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.ticker}>
                {company.name} ({company.ticker})
              </option>
            ))}
          </select>
        </div>

        {companyInfo && (
          <div className="mt-4 p-[10px] border border-gray-200 rounded-md">
            <p><strong>ticker:</strong> {companyInfo.ticker}</p>
            <p><strong>Name:</strong> {companyInfo.name}</p>
            <p><strong>Legal name:</strong> {companyInfo.legal_name}</p>
            <p><strong>Stock exchange:</strong> {companyInfo.stock_exchange}</p>
            <p><strong>Short description:</strong> {companyInfo.short_description}</p>
            <p><strong>Long description:</strong> {companyInfo.long_description}</p>
            <p><strong>Web:</strong> <a href={`https://${companyInfo.company_url}`} target="_blank" rel="noopener noreferrer">{companyInfo.company_url}</a></p>
            <p><strong>Business address:</strong> {companyInfo.business_address}</p>
            <p><strong>Business phone:</strong> {companyInfo.business_phone_no}</p>
            <p><strong>Entity legal form:</strong> {companyInfo.entity_legal_form || 'N/A'}</p>
            <p><strong>Latest filing date:</strong> {companyInfo.latest_filing_date || 'N/A'}</p>
            <p><strong>Inc country:</strong> {companyInfo.inc_country}</p>
            <p><strong>Employees:</strong> {companyInfo.employees}</p>
            <p><strong>Sector:</strong> {companyInfo.sector}</p>
            <p><strong>Industry Category:</strong> {companyInfo.industry_category}</p>
            <p><strong>Industry Group:</strong> {companyInfo.industry_group}</p>
            <p><strong>First Stock Price Date:</strong> {companyInfo.first_stock_price_date}</p>
            <p><strong>Last Stock Price Date:</strong> {companyInfo.last_stock_price_date}</p>
            <p><strong>Legacy Industry Category:</strong> {companyInfo.legacy_industry_category}</p>
            <p><strong>Legacy Industry Group:</strong> {companyInfo.legacy_industry_group}</p>
          </div>
        )}
      </div>
    </MosaicWindow>
  );
};

export default ExampleApp;
