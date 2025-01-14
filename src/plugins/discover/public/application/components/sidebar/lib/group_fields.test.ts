/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import { groupFields } from './group_fields';
import { getDefaultFieldFilter } from './field_filter';

describe('group_fields', function () {
  it('should group fields in selected, popular, unpopular group', function () {
    const fields = [
      {
        name: 'category',
        type: 'string',
        opensearchTypes: ['text'],
        count: 1,
        scripted: false,
        searchable: true,
        aggregatable: true,
        readFromDocValues: true,
      },
      {
        name: 'currency',
        type: 'string',
        opensearchTypes: ['keyword'],
        count: 0,
        scripted: false,
        searchable: true,
        aggregatable: true,
        readFromDocValues: true,
      },
      {
        name: 'customer_birth_date',
        type: 'date',
        opensearchTypes: ['date'],
        count: 0,
        scripted: false,
        searchable: true,
        aggregatable: true,
        readFromDocValues: true,
      },
    ];

    const fieldCounts = {
      category: 1,
      currency: 1,
      customer_birth_date: 1,
    };

    const fieldFilterState = getDefaultFieldFilter();

    const actual = groupFields(fields as any, ['currency'], 5, fieldCounts, fieldFilterState);
    expect(actual).toMatchInlineSnapshot(`
      Object {
        "popular": Array [
          Object {
            "aggregatable": true,
            "count": 1,
            "name": "category",
            "opensearchTypes": Array [
              "text",
            ],
            "readFromDocValues": true,
            "scripted": false,
            "searchable": true,
            "type": "string",
          },
        ],
        "selected": Array [
          Object {
            "aggregatable": true,
            "count": 0,
            "name": "currency",
            "opensearchTypes": Array [
              "keyword",
            ],
            "readFromDocValues": true,
            "scripted": false,
            "searchable": true,
            "type": "string",
          },
        ],
        "unpopular": Array [
          Object {
            "aggregatable": true,
            "count": 0,
            "name": "customer_birth_date",
            "opensearchTypes": Array [
              "date",
            ],
            "readFromDocValues": true,
            "scripted": false,
            "searchable": true,
            "type": "date",
          },
        ],
      }
    `);
  });
});
